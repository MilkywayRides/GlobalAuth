package com.blazeneuro.auth

object OAuthConfig {
    const val CLIENT_ID = "bn_b1ee0548f8d4488542f8d4d8f38d0a63"
    const val REDIRECT_URI = "blazeneuro://auth"
    const val SCOPE = "read write"
    
    fun getClientSecret(): String {
        // Client secret stored securely - will be encrypted
        return "bn_0ccebe24dce21d1f0cc76c7bfc339030071c4adb9836cc01502808336f85512c"
    }
}
