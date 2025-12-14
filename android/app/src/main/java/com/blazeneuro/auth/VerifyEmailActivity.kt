package com.blazeneuro.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.blazeneuro.developer.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class VerifyEmailActivity : AppCompatActivity() {
    private lateinit var email: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_verify_email)

        email = intent.getStringExtra("email") ?: ""

        val emailText = findViewById<TextView>(R.id.emailText)
        val codeInput = findViewById<EditText>(R.id.codeInput)
        val verifyButton = findViewById<Button>(R.id.verifyButton)
        val resendButton = findViewById<TextView>(R.id.resendButton)

        emailText.text = "We sent a code to $email"

        verifyButton.setOnClickListener {
            val code = codeInput.text.toString()
            if (code.length == 6) {
                verifyEmail(code)
            } else {
                Toast.makeText(this, "Please enter 6-digit code", Toast.LENGTH_SHORT).show()
            }
        }

        resendButton.setOnClickListener {
            resendCode()
        }
    }

    private fun verifyEmail(code: String) {
        CoroutineScope(Dispatchers.Main).launch {
            val result = withContext(Dispatchers.IO) {
                try {
                    val url = URL("https://developer.blazeneuro.com/api/mobile/auth/verify-email")
                    val connection = url.openConnection() as HttpURLConnection

                    connection.apply {
                        requestMethod = "POST"
                        setRequestProperty("Content-Type", "application/json")
                        doOutput = true
                    }

                    val json = JSONObject().apply {
                        put("email", email)
                        put("code", code)
                    }

                    connection.outputStream.use { it.write(json.toString().toByteArray()) }

                    if (connection.responseCode == 200) {
                        Result.success(true)
                    } else {
                        val error = connection.errorStream?.bufferedReader()?.readText() ?: "Verification failed"
                        Result.failure(Exception(error))
                    }
                } catch (e: Exception) {
                    Result.failure(e)
                }
            }

            result.onSuccess {
                Toast.makeText(this@VerifyEmailActivity, "Email verified!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@VerifyEmailActivity, HomeActivity::class.java))
                finish()
            }.onFailure { error ->
                Toast.makeText(this@VerifyEmailActivity, "Verification failed: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun resendCode() {
        CoroutineScope(Dispatchers.Main).launch {
            val result = withContext(Dispatchers.IO) {
                try {
                    val url = URL("https://developer.blazeneuro.com/api/mobile/auth/resend-code")
                    val connection = url.openConnection() as HttpURLConnection

                    connection.apply {
                        requestMethod = "POST"
                        setRequestProperty("Content-Type", "application/json")
                        doOutput = true
                    }

                    val json = JSONObject().apply {
                        put("email", email)
                    }

                    connection.outputStream.use { it.write(json.toString().toByteArray()) }

                    if (connection.responseCode == 200) {
                        Result.success(true)
                    } else {
                        Result.failure(Exception("Failed to resend code"))
                    }
                } catch (e: Exception) {
                    Result.failure(e)
                }
            }

            result.onSuccess {
                Toast.makeText(this@VerifyEmailActivity, "Code sent!", Toast.LENGTH_SHORT).show()
            }.onFailure { error ->
                Toast.makeText(this@VerifyEmailActivity, "Failed to resend: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
