
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { telegram_username, telegram_group_handle, user_id, group_id } = await req.json()
    
    console.log('Telegram verification request:', { telegram_username, telegram_group_handle, user_id, group_id })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check rate limiting - max 3 attempts per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: attemptCount } = await supabase
      .from('user_telegram_verification')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('group_id', group_id)
      .gte('created_at', oneHourAgo)

    if (attemptCount && attemptCount >= 3) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          reason: 'Rate limit exceeded. Please try again later.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      )
    }

    // Get Telegram Bot Token
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!telegramToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured')
      return new Response(
        JSON.stringify({ 
          verified: false, 
          reason: 'Telegram verification service not configured' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get group details to check minimum membership months
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('min_membership_months')
      .eq('id', group_id)
      .single()

    if (groupError || !groupData) {
      console.error('Error fetching group data:', groupError)
      return new Response(
        JSON.stringify({ 
          verified: false, 
          reason: 'Group not found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const minMonths = groupData.min_membership_months || 6

    // Clean username and group handle
    const cleanUsername = telegram_username.replace('@', '')
    const cleanGroupHandle = telegram_group_handle.replace('@', '')
    
    try {
      // First, try to get user info by username to get their user ID
      const getUserUrl = `https://api.telegram.org/bot${telegramToken}/getChat`
      const userResponse = await fetch(getUserUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: `@${cleanUsername}`
        })
      })

      const userResult = await userResponse.json()
      console.log('Get user response:', userResult)

      if (!userResult.ok) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            reason: 'Telegram username not found. Please check your username and ensure it is publicly visible.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const telegramUserId = userResult.result.id

      // Now check if this user is a member of the group
      const getChatMemberUrl = `https://api.telegram.org/bot${telegramToken}/getChatMember`
      const memberResponse = await fetch(getChatMemberUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: `@${cleanGroupHandle}`,
          user_id: telegramUserId
        })
      })

      const memberResult = await memberResponse.json()
      console.log('Get chat member response:', memberResult)

      if (!memberResult.ok) {
        // Handle specific Telegram API errors
        if (memberResult.error_code === 400) {
          return new Response(
            JSON.stringify({ 
              verified: false, 
              reason: 'User not found in Telegram group. Please ensure you are a member of the group and your username is correct.' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (memberResult.error_code === 403) {
          return new Response(
            JSON.stringify({ 
              verified: false, 
              reason: 'Bot does not have permission to access this group. Please contact the group administrator to add the verification bot.' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          return new Response(
            JSON.stringify({ 
              verified: false, 
              reason: `Telegram verification failed: ${memberResult.description}` 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      const memberData = memberResult.result
      const memberStatus = memberData.status

      // Check if user is an active member (not left, kicked, or restricted)
      if (!['member', 'administrator', 'creator'].includes(memberStatus)) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            reason: `You are not an active member of the Telegram group. Current status: ${memberStatus}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check membership duration if join date is available
      let membershipValid = true
      let membershipReason = ''

      if (memberData.date) {
        const joinDate = new Date(memberData.date * 1000) // Telegram timestamps are in seconds
        const monthsAgo = new Date()
        monthsAgo.setMonth(monthsAgo.getMonth() - minMonths)
        
        if (joinDate > monthsAgo) {
          membershipValid = false
          membershipReason = `You need to be a member for at least ${minMonths} months. You joined on ${joinDate.toDateString()}.`
        }
      }

      // Store verification result
      const verificationData = {
        telegram_user_response: userResult,
        telegram_member_response: memberResult,
        verified_at: new Date().toISOString(),
        membership_duration_check: membershipValid,
        member_status: memberStatus,
        telegram_user_id: telegramUserId
      }

      const verificationStatus = membershipValid ? 'verified' : 'failed'
      const verifiedAt = membershipValid ? new Date().toISOString() : null

      // Insert or update verification record
      const { error: upsertError } = await supabase
        .from('user_telegram_verification')
        .upsert({
          user_id,
          group_id,
          telegram_username: cleanUsername,
          verification_status: verificationStatus,
          verified_at: verifiedAt,
          verification_data: verificationData,
          verification_attempts: 1
        }, {
          onConflict: 'user_id,group_id'
        })

      if (upsertError) {
        console.error('Error storing verification result:', upsertError)
      }

      return new Response(
        JSON.stringify({ 
          verified: membershipValid, 
          reason: membershipValid ? 'Verification successful!' : membershipReason,
          data: {
            member_status: memberStatus,
            join_date: memberData.date ? new Date(memberData.date * 1000).toISOString() : null,
            telegram_user_id: telegramUserId
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (telegramError) {
      console.error('Telegram API error:', telegramError)
      
      // Store failed verification attempt
      await supabase
        .from('user_telegram_verification')
        .upsert({
          user_id,
          group_id,
          telegram_username: cleanUsername,
          verification_status: 'failed',
          verification_data: { error: telegramError.message },
          verification_attempts: 1
        }, {
          onConflict: 'user_id,group_id'
        })

      return new Response(
        JSON.stringify({ 
          verified: false, 
          reason: 'Failed to connect to Telegram. Please try again later.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

  } catch (error) {
    console.error('Verification error:', error)
    return new Response(
      JSON.stringify({ 
        verified: false, 
        reason: 'Internal server error during verification' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
