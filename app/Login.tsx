import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useUser } from './UserContext'; // Import UserContext
import { Ionicons } from '@expo/vector-icons';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setEmail: setGlobalEmail } = useUser();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);

      setGlobalEmail(userCredential.user.email);

      const userRef = doc(db, 'Users', userCredential.user.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userType = userData.userType;

        if (userType === 'Admin') {
          router.replace('/WelcomeAdmin');
        } else if (userType === 'Client') {
          router.replace('/Welcome');
        } else if (userType === 'DeliveryMan') {
          router.replace('/WelcomeDelivery');
        }
      } else {
        throw new Error('User data not found.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#FFFFFF']} style={styles.container}>
      <Image source={{ uri: 'https://i.imgur.com/SUJsGzT.png' }} style={styles.logo} />
      <Text style={styles.logoText}>Login</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#AAA"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#AAA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} // Toggle password visibility
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword((prev) => !prev)} // Toggle state
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#AAA"
            />
          </TouchableOpacity>
        </View>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.signUpText}>
        Don’t have an account?{' '}
        <Text style={styles.signUpLink} onPress={() => router.replace('/SignUp')}>
          Sign up here
        </Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  form: {
    width: '85%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginTop: 10,
  },
  signUpText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4CAF50',
  },
  signUpLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
