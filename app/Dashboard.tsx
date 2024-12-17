import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { PieChart } from 'react-native-chart-kit';
import app from '../firebaseConfig';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const db = getFirestore(app);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, promoCodes: 0 });
  const [userTypeData, setUserTypeData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collections
        const usersSnapshot = await getDocs(collection(db, 'Users'));
        const productsSnapshot = await getDocs(collection(db, 'Products'));
        const ordersSnapshot = await getDocs(collection(db, 'Orders'));
        const promoCodesSnapshot = await getDocs(collection(db, 'PromoCodes'));

        setStats({
          users: usersSnapshot.size,
          products: productsSnapshot.size,
          orders: ordersSnapshot.size,
          promoCodes: promoCodesSnapshot.size,
        });

        // Pie Chart Data - User Types
        const userTypes = usersSnapshot.docs.map((doc) => doc.data().userType);
        const userTypeCounts = {};
        userTypes.forEach((type) => {
          userTypeCounts[type] = (userTypeCounts[type] || 0) + 1;
        });

        const formattedUserTypeData = Object.keys(userTypeCounts).map((key, index) => ({
          name: key,
          population: userTypeCounts[key],
          color: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2'][index % 4],
          legendFontColor: '#333',
          legendFontSize: 12,
        }));
        setUserTypeData(formattedUserTypeData);

        // Pie Chart Data - Product Categories
        const categories = productsSnapshot.docs.map((doc) => doc.data().category);
        const categoryCounts = {};
        categories.forEach((cat) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const formattedProductData = Object.keys(categoryCounts).map((key, index) => ({
          name: key,
          population: categoryCounts[key],
          color: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2'][index % 4],
          legendFontColor: '#333',
          legendFontSize: 12,
        }));
        setProductData(formattedProductData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/WelcomeAdmin')}>
          <Ionicons name="arrow-back-outline" size={32} color="#FF0000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/SettingsAdmin')}>
          <Ionicons name="settings-outline" size={32} color="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {[
          { title: 'Users', count: stats.users, icon: 'people-outline', color: '#4E79A7', route: '/DashboardUsers' },
          { title: 'Products', count: stats.products, icon: 'cube-outline', color: '#F28E2B', route: '/DashboardProducts' },
          { title: 'Orders', count: stats.orders, icon: 'receipt-outline', color: '#59A14F', route: '/Dashboard' },
          { title: 'Promo Codes', count: stats.promoCodes, icon: 'pricetag-outline', color: '#E15759', route: '/DashboardPromoCodes' },
        ].map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: stat.color }]}
            onPress={() => router.replace(stat.route)} // Redirect on card press
          >
            <Ionicons name={stat.icon} size={40} color="#FFF" />
            <Text style={styles.cardTitle}>{stat.count}</Text>
            <Text style={styles.cardSubtitle}>{stat.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pie Chart - User Types */}
      <Text style={styles.chartTitle}>User Types</Text>
      <PieChart
        data={userTypeData}
        width={width - 40}
        height={250}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Pie Chart - Product Categories */}
      <Text style={styles.chartTitle}>Product Categories</Text>
      <PieChart
        data={productData}
        width={width - 40}
        height={250}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        chartConfig={chartConfig}
        style={styles.chart}
      />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Dark text
  labelColor: (opacity = 1) => `#333`,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F8F8', // Subtle gray for header background
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Light border for separation
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconButton: {
    padding: 5,
  },
  headerText: {
    color: '#FF5722', // Orange header text for Admin
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    width: '45%',
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cardSubtitle: {
    color: '#FFF',
    fontSize: 14,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
    textAlign: 'center',
  },
  chart: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#FF0000',
  },
});
