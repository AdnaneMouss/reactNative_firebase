import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from './firebaseConfig'; // Your Firebase configuration file

const db = getFirestore(app);

// Fetch all products
export const fetchAllProducts = async () => {
  try {
    const productsRef = collection(db, 'Products'); // Reference to "Products" collection
    const snapshot = await getDocs(productsRef); // Fetch all documents in the collection
    return snapshot.docs.map((doc) => ({
      id: doc.id, // Include the document ID
      ...doc.data(), // Include all other fields
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCartItems = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required to fetch the cart.');
    }

    const cartRef = doc(db, 'Cart', email); // Reference to the user's cart document
    const cartDoc = await getDoc(cartRef); // Fetch the document

    if (!cartDoc.exists()) {
      console.log('No cart found for the user.');
      return []; // Return an empty array if the cart doesn't exist
    }

    return cartDoc.data().items || []; // Return items or an empty array if no items are present
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};



