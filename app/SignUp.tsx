import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import app from '../firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

export default function SignUp() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      imageURL: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      phone: Yup.string()
        .matches(/^[0-9]+$/, 'Phone number must contain only numbers')
        .min(10, 'Phone number must be at least 10 digits')
        .required('Phone number is required'),
      email: Yup.string()
        .email('Invalid email format')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Confirm your password'),
      imageURL: Yup.string()
        .url('Enter a valid URL for the image')
        .required('Image URL is required'),
    }),
    onSubmit: async (values) => {
      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        // Add user details to Firestore
        await setDoc(doc(db, 'Users', user.uid), {
          name: values.name,
          phone: values.phone,
          email: values.email,
          imageURL: values.imageURL,
          userType: 'Client', // Default user type
          createdAt: new Date().toISOString(),
        });

        Alert.alert('Success', 'Account created successfully!');
        console.log('User signed up and details saved to Firestore:', user);

        // Redirect to Login page
        router.replace('/Login');
      } catch (error: any) {
        console.error('Sign-up failed:', error.message);
        Alert.alert('Error', error.message);
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Create a New Account</Text>

      {/* Full Name Input */}
      <TextInput
        style={[styles.input, formik.errors.name && formik.touched.name ? styles.inputError : null]}
        placeholder="Full Name"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('name')}
        onBlur={formik.handleBlur('name')}
        value={formik.values.name}
      />
      {formik.errors.name && formik.touched.name && (
        <Text style={styles.errorText}>{formik.errors.name}</Text>
      )}

      {/* Phone Number Input */}
      <TextInput
        style={[styles.input, formik.errors.phone && formik.touched.phone ? styles.inputError : null]}
        placeholder="Phone Number"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('phone')}
        onBlur={formik.handleBlur('phone')}
        value={formik.values.phone}
        keyboardType="phone-pad"
      />
      {formik.errors.phone && formik.touched.phone && (
        <Text style={styles.errorText}>{formik.errors.phone}</Text>
      )}

      {/* Email Input */}
      <TextInput
        style={[styles.input, formik.errors.email && formik.touched.email ? styles.inputError : null]}
        placeholder="Email"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        value={formik.values.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {formik.errors.email && formik.touched.email && (
        <Text style={styles.errorText}>{formik.errors.email}</Text>
      )}

      {/* Image URL Input */}
      <TextInput
        style={[styles.input, formik.errors.imageURL && formik.touched.imageURL ? styles.inputError : null]}
        placeholder="Image URL"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('imageURL')}
        onBlur={formik.handleBlur('imageURL')}
        value={formik.values.imageURL}
      />
      {formik.errors.imageURL && formik.touched.imageURL && (
        <Text style={styles.errorText}>{formik.errors.imageURL}</Text>
      )}

      {/* Password Input */}
      <TextInput
        style={[styles.input, formik.errors.password && formik.touched.password ? styles.inputError : null]}
        placeholder="Password"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        value={formik.values.password}
        secureTextEntry
      />
      {formik.errors.password && formik.touched.password && (
        <Text style={styles.errorText}>{formik.errors.password}</Text>
      )}

      {/* Confirm Password Input */}
      <TextInput
        style={[styles.input, formik.errors.confirmPassword && formik.touched.confirmPassword ? styles.inputError : null]}
        placeholder="Confirm Password"
        placeholderTextColor="#AAA"
        onChangeText={formik.handleChange('confirmPassword')}
        onBlur={formik.handleBlur('confirmPassword')}
        value={formik.values.confirmPassword}
        secureTextEntry
      />
      {formik.errors.confirmPassword && formik.touched.confirmPassword && (
        <Text style={styles.errorText}>{formik.errors.confirmPassword}</Text>
      )}

      {/* Sign-Up Button */}
      <TouchableOpacity style={styles.signUpButton} onPress={formik.handleSubmit}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Redirect to Login */}
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text style={styles.loginLink} onPress={() => router.replace('/Login')}>
          Log in here
        </Text>
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#4CAF50',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  loginLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
