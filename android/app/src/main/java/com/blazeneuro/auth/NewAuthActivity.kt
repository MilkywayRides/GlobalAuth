package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.developer.R
import com.blazeneuro.developer.api.AuthApiClient
import com.blazeneuro.developer.api.SocialAuthManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NewAuthActivity : AppCompatActivity() {
    private lateinit var apiClient: AuthApiClient
    private lateinit var socialAuthManager: SocialAuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)

        apiClient = AuthApiClient(this)
        socialAuthManager = SocialAuthManager(this)

        setupViews()
    }

    private fun setupViews() {
        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val signupButton = findViewById<Button>(R.id.signupButton)
        val googleButton = findViewById<Button>(R.id.googleButton)
        val githubButton = findViewById<Button>(R.id.githubButton)

        loginButton.setOnClickListener {
            val email = emailInput.text.toString()
            val password = passwordInput.text.toString()
            
            if (email.isNotEmpty() && password.isNotEmpty()) {
                login(email, password)
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        signupButton.setOnClickListener {
            val email = emailInput.text.toString()
            val password = passwordInput.text.toString()
            
            if (email.isNotEmpty() && password.isNotEmpty()) {
                signup("User", email, password)
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        googleButton.setOnClickListener {
            loginWithGoogle()
        }

        githubButton.setOnClickListener {
            loginWithGithub()
        }
    }

    private fun login(email: String, password: String) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = apiClient.login(email, password)
            
            result.onSuccess {
                Toast.makeText(this@NewAuthActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                navigateToHome()
            }.onFailure { error ->
                Toast.makeText(this@NewAuthActivity, "Login failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun signup(name: String, email: String, password: String) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = apiClient.signup(name, email, password)
            
            result.onSuccess {
                Toast.makeText(this@NewAuthActivity, "Signup successful!", Toast.LENGTH_SHORT).show()
                navigateToHome()
            }.onFailure { error ->
                Toast.makeText(this@NewAuthActivity, "Signup failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loginWithGoogle() {
        CoroutineScope(Dispatchers.Main).launch {
            val result = socialAuthManager.startGoogleAuth()
            
            result.onSuccess { authUrl ->
                socialAuthManager.openAuthUrl(authUrl)
            }.onFailure {
                Toast.makeText(this@NewAuthActivity, "Failed to start Google auth", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun loginWithGithub() {
        CoroutineScope(Dispatchers.Main).launch {
            val result = socialAuthManager.startGithubAuth()
            
            result.onSuccess { authUrl ->
                socialAuthManager.openAuthUrl(authUrl)
            }.onFailure {
                Toast.makeText(this@NewAuthActivity, "Failed to start GitHub auth", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun navigateToHome() {
        startActivity(Intent(this, HomeActivity::class.java))
        finish()
    }
}
