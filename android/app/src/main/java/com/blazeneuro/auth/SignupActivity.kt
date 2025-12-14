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

class SignupActivity : AppCompatActivity() {
    private lateinit var apiClient: AuthApiClient
    private lateinit var socialAuthManager: SocialAuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        apiClient = AuthApiClient(this)
        socialAuthManager = SocialAuthManager(this)

        handleOAuthCallback()

        val nameInput = findViewById<EditText>(R.id.nameInput)
        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val signupButton = findViewById<Button>(R.id.signupButton)
        val googleButton = findViewById<Button>(R.id.googleButton)
        val githubButton = findViewById<Button>(R.id.githubButton)
        val loginLink = findViewById<TextView>(R.id.loginLink)

        signupButton.setOnClickListener {
            val name = nameInput.text.toString()
            val email = emailInput.text.toString()
            val password = passwordInput.text.toString()

            if (name.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()) {
                signup(name, email, password)
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

        loginLink.setOnClickListener {
            finish()
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
                    Toast.makeText(this, "Signup failed: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun signup(name: String, email: String, password: String) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = apiClient.signup(name, email, password)

            result.onSuccess {
                Toast.makeText(this@SignupActivity, "Account created! Please verify your email.", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@SignupActivity, VerifyEmailActivity::class.java)
                intent.putExtra("email", email)
                startActivity(intent)
                finish()
            }.onFailure { error ->
                Toast.makeText(this@SignupActivity, "Signup failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
