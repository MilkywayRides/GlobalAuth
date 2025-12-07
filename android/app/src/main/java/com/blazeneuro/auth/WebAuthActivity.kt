package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.blazeneuro.auth.databinding.ActivityWebAuthBinding
import kotlinx.coroutines.launch

class WebAuthActivity : AppCompatActivity() {
    private lateinit var binding: ActivityWebAuthBinding
    private lateinit var apiService: ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWebAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        apiService = ApiClient.create(this)
        val authType = intent.getStringExtra("auth_type") ?: "login"
        setupWebView(authType)
    }
    
    private fun setupWebView(authType: String) {
        binding.webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
        }
        
        binding.webView.addJavascriptInterface(WebAppInterface(), "Android")
        
        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url?.startsWith("blazeneuro://auth") == true) {
                    extractTokenFromUrl(url)
                    return true
                }
                return false
            }
        }
        
        // Build OAuth URL with your credentials
        val baseUrl = "https://developer.blazeneuro.com"
        val oauthUrl = buildString {
            append("$baseUrl/oauth/authorize?")
            append("response_type=code&")
            append("client_id=${OAuthConfig.CLIENT_ID}&")
            append("redirect_uri=${OAuthConfig.REDIRECT_URI}&")
            append("scope=${OAuthConfig.SCOPE}")
            if (authType == "signup") append("&signup=true")
        }
        
        binding.webView.loadUrl(oauthUrl)
    }
    
    private fun extractTokenFromUrl(url: String) {
        val code = url.substringAfter("code=").substringBefore("&")
        if (code.isNotEmpty()) {
            exchangeCodeForToken(code)
        }
    }
    
    private fun exchangeCodeForToken(code: String) {
        lifecycleScope.launch {
            try {
                // Exchange authorization code for access token
                val tokenRequest = TokenRequest(
                    code = code,
                    clientId = OAuthConfig.CLIENT_ID,
                    clientSecret = OAuthConfig.getClientSecret(),
                    redirectUri = OAuthConfig.REDIRECT_URI
                )
                
                val response = apiService.exchangeToken(tokenRequest)
                SecureStorage.storeApiKey(this@WebAuthActivity, response.accessToken)
                verifyAndProceed()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    private fun verifyAndProceed() {
        lifecycleScope.launch {
            try {
                val response = apiService.verifyToken()
                storeUserData(response.user)
                startActivity(Intent(this@WebAuthActivity, HomeActivity::class.java))
                finish()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    private fun storeUserData(user: User) {
        getSharedPreferences("user_prefs", MODE_PRIVATE)
            .edit()
            .putBoolean("logged_in", true)
            .putString("user_name", user.name)
            .putString("user_email", user.email)
            .putString("user_id", user.id)
            .apply()
    }
    
    inner class WebAppInterface {
        @JavascriptInterface
        fun receiveToken(token: String) {
            SecureStorage.storeApiKey(this@WebAuthActivity, token)
            runOnUiThread { verifyAndProceed() }
        }
    }
}
