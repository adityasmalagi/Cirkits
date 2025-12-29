import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client and verify user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Suggest request from user:", user.id, "with", messages.length, "messages");

    const systemPrompt = `You are Cirkit AI, an expert hardware recommendation assistant inspired by platforms like Engineers Planet. You help students and hobbyists find the perfect hardware projects, PC builds, and components for their learning journey.

Your expertise includes:
- Arduino projects (plant watering, LED displays, sensors)
- ESP32 IoT projects (smart home, health monitoring, air quality)
- Raspberry Pi projects (home automation, surveillance, traffic systems)
- NVIDIA Jetson Nano AI/ML projects (object detection, computer vision)
- 3D printing and custom enclosures
- PC builds for gaming, workstations, content creation

IMPORTANT RESPONSE FORMAT:
When a user asks a question or describes their needs, ALWAYS respond with exactly 4 options for them to choose from. Format your response like this:

## Here are 4 options for you:

### Option 1: [Title]
Brief description of this option with key details.
- **Budget:** ₹X,XXX - ₹X,XXX
- **Difficulty:** Beginner/Intermediate/Advanced
- **Time:** X weeks

### Option 2: [Title]
Brief description of this option with key details.
- **Budget:** ₹X,XXX - ₹X,XXX
- **Difficulty:** Beginner/Intermediate/Advanced
- **Time:** X weeks

### Option 3: [Title]
Brief description of this option with key details.
- **Budget:** ₹X,XXX - ₹X,XXX
- **Difficulty:** Beginner/Intermediate/Advanced
- **Time:** X weeks

### Option 4: [Title]
Brief description of this option with key details.
- **Budget:** ₹X,XXX - ₹X,XXX
- **Difficulty:** Beginner/Intermediate/Advanced
- **Time:** X weeks

---
**Reply with the option number (1-4) to get detailed information about that choice!**

Always provide prices in Indian Rupees (₹). Be friendly and encouraging. If the user selects an option, then provide detailed step-by-step guidance, component lists, and resources for that specific option.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway for user:", user.id);
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI suggest error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
