package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.developer.R
import com.blazeneuro.developer.api.AuthApiClient
import com.blazeneuro.developer.api.SocialAuthManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var apiClient: AuthApiClient
    private lateinit var socialAuthManager: SocialAuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        apiClient = AuthApiClient(this)
        socialAuthManager = SocialAuthManager(this)

        handleOAuthCallback()

        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val googleButton = findViewById<Button>(R.id.googleButton)
        val githubButton = findViewById<Button>(R.id.githubButton)
        val signupLink = findViewById<TextView>(R.id.signupLink)

        loginButton.setOnClickListener {
            val email = emailInput.text.toString()
            val password = passwordInput.text.toString()

            if (email.isNotEmpty() && password.isNotEmpty()) {
                login(email, password)
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        googleButton.setOnClickListener {
            socialAuthManager.startGoogleAuth()
        }

        githubButton.setOnClickListener {
            socialAuthManager.startGithubAuth()
        }

        signupLink.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleOAuthCallback()
    }

    private fun handleOAuthCallback() {
        intent?.data?.let { uri ->
            if (uri.scheme == "blazeneuro" && uri.host == "auth") {
                val result = socialAuthManager.handleAuthCallback(uri)
                result.onSuccess { authResponse ->
                    Toast.makeText(this, "Welcome ${authResponse.user.name}!", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                }.onFailure { error ->
                    Toast.makeText(this, "Login failed: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun login(email: String, password: String) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = apiClient.login(email, password)

            result.onSuccess {
                Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@LoginActivity, HomeActivity::class.java))
                finish()
            }.onFailure { error ->
                Toast.makeText(this@LoginActivity, "Login failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
