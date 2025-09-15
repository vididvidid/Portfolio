import { createClient } from '@supabase/supabase-js'

// Define the correct Env interface
interface Env {
  PORTFOLIO_KV: KVNamespace
  PORTFOLIO_STORAGE: R2Bucket
  
  // Use the new, correct variable names
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

// Helper function for JSON responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Default portfolio content
const getDefaultContent = () => ({
  "hero": {
    "name": "Yash Kumar Kasaudhan",
    "tagline": "<strong>GSoC Contributor</strong> • <strong>ICPC Regionalist</strong> • <strong>SIH Grand Finalist</strong>",
    "subtitle": "Building scalable solutions at the intersection of algorithms and innovation.",
    "bio": "Focused on transforming complex technical challenges into elegant, production-ready systems.",
    "socials": [
      {
        "name": "GitHub",
        "url": "https://github.com/vididvidid/",
        "icon": "github"
      },
      {
        "name": "LinkedIn",
        "url": "https://www.linkedin.com/in/yash-kumar-kasaudhan/",
        "icon": "linkedin"
      },
      {
        "name": "Twitter", 
        "url": "https://x.com/yashKumarKasau",
        "icon": "twitter"
      }
    ]
  },
  // ... rest of your default portfolio data
})

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const supabase = createClient(
      env.SUPABASE_URL, // Use the full URL directly
      env.SUPABASE_ANON_KEY, // Use the anon key
      {
        auth: { persistSession: false },
        // The 'global: { fetch }' part is not needed in modern workers
      }
    )

    try {
      // GET /portfolio - Load portfolio data
      if (url.pathname === '/portfolio' && req.method === 'GET') {
        try {
          console.log('🔍 Loading portfolio from KV store...')
          
          const savedContent = await env.PORTFOLIO_KV.get('portfolio_data', 'json')
          if (savedContent) {
            console.log('✅ Portfolio loaded from KV store')
            return jsonResponse(savedContent)
          }
          
          console.log('📄 Using default content')
          return jsonResponse(getDefaultContent())
        } catch (error) {
          console.error('❌ Error loading portfolio:', error)
          return jsonResponse(getDefaultContent())
        }
      }

      // PUT /portfolio - Save portfolio data (requires auth)
      if (url.pathname === '/portfolio' && req.method === 'PUT') {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1]
          if (!accessToken) {
            return jsonResponse({ error: 'No authorization token provided' }, 401)
          }
          
          const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
          if (authError || !user) {
            console.log('❌ Auth error:', authError?.message)
            return jsonResponse({ error: 'Unauthorized' }, 401)
          }
          
          const content = await req.json()
          await env.PORTFOLIO_KV.put('portfolio_data', JSON.stringify(content))
          
          console.log('✅ Portfolio updated for user:', user.email)
          return jsonResponse({ message: 'Portfolio updated successfully' })
        } catch (error) {
          console.error('❌ Update error:', error)
          return jsonResponse({ error: 'Internal server error' }, 500)
        }
      }

      // POST /api/login - Admin login
      if (url.pathname === '/api/login' && req.method === 'POST') {
        try {
          const { email, password } = await req.json() as { email: string; password: string }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return jsonResponse({ error: error.message }, 400)
          }

          if (data.session && data.user) {
            return jsonResponse({
              access_token: data.session.access_token,
              user_id: data.user.id,
              email: data.user.email,
            })
          } else {
            return jsonResponse(
              { error: 'Login successful but no session was created.' },
              500
            )
          }
        } catch (error) {
          console.error('Error in /api/login:', error)
          return jsonResponse({ error: 'An internal server error occurred.' }, 500)
        }
      }

      // POST /register - Create admin user (one-time setup)
      if (url.pathname === '/register' && req.method === 'POST') {
        try {
          const { email, password, name } = await req.json() as { email: string; password: string; name: string }

          const { error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { name },
            email_confirm: true
          })

          if (error) {
            return jsonResponse({ error: error.message }, 400)
          }

          console.log('✅ Admin registered:', email)
          return jsonResponse({ message: 'Admin registered successfully' })
        } catch (error) {
          console.error('❌ Registration error:', error)
          return jsonResponse({ error: 'Registration failed' }, 500)
        }
      }

      // POST /upload-image - Handle file uploads (requires auth)
      if (url.pathname === '/upload-image' && req.method === 'POST') {
        try {
          const accessToken = req.headers.get('Authorization')?.split(' ')[1]
          if (!accessToken) {
            return jsonResponse({ error: 'No authorization token provided' }, 401)
          }

          const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
          if (authError || !user) {
            return jsonResponse({ error: 'Unauthorized' }, 401)
          }

          const formData = await req.formData()
          const image = formData.get('image') as File

          if (!image) {
            return jsonResponse({ error: 'No image provided' }, 400)
          }

          // Generate unique filename
          const fileExtension = image.name.split('.').pop() || 'jpg'
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`

          // Upload to R2
          await env.PORTFOLIO_STORAGE.put(fileName, image.stream(), {
            httpMetadata: {
              contentType: image.type,
              cacheControl: 'public, max-age=31536000', // 1 year
            }
          })

          // Generate public URL (adjust based on your R2 setup)  
          const imageUrl = `https://your-r2-domain.com/${fileName}`

          console.log('✅ Image uploaded:', fileName)
          return jsonResponse({ 
            url: imageUrl,
            fileName: fileName 
          })
        } catch (error) {
          console.error('❌ Image upload error:', error)
          return jsonResponse({ error: 'Upload failed' }, 500)
        }
      }

      // GET /health - Health check
      if (url.pathname === '/health' && req.method === 'GET') {
        return jsonResponse({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          service: 'Portfolio API'
        })
      }

      return jsonResponse({ error: 'Not found' }, 404)
      
    } catch (error) {
      console.error('❌ Worker error:', error)
      return jsonResponse({ error: 'Internal server error' }, 500)
    }
  },
}
