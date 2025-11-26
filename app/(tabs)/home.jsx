import { View, Text, ScrollView, Image, StyleSheet, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Categories from '../../components/Categories';
import Arti from '../Veeds/Arti';
import Quotes from '../../Configs/quotes.json';
import { Colors } from '../../constants/Colors';
import { auth, fireDB } from '../../Configs/FirebaseConfig';

export default function HomeScreen() {
  const currentUser = useSelector((state) => state.auth.user);
  const user = auth().currentUser;
  const navigation = useNavigation();

  const [categoriesData, setCategoriesData] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Mahadev');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState("bAUMuuRH99o");

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  const handleChangeCategory = (category) => {
    fetchBooksByCategory(category);
    setActiveCategory(category);
    setBooks([]);
  }

  const handlePlayIconPress = async (category) => {
    try {
      const categoryRef = fireDB
        .collection('categories')
        .doc('MNfBRAvIBxnjZLxklVuQ')
        .collection('storiesCategory')
        .where('strCategory', '==', category);

      const querySnapshot = await categoryRef.get();
      if (!querySnapshot.empty) {
        const categoryDoc = querySnapshot.docs[0];
        setVideoUrl(categoryDoc.data().videoUrl);
        toggleModal();
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchBooksByCategory();
  }, [currentUser]);

  const fetchUser = async () => {
    try {
      if (user) {
        const userDocRef = fireDB.collection('users').doc(currentUser.uid);
        const documentSnapshot = await userDocRef.get();
        if (documentSnapshot.exists) {
          console.log('User data:', documentSnapshot.data());
        } else {
          console.log('No such document!');
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      if (user) {
        const storiesCategoryRef = fireDB
          .collection('categories')
          .doc('MNfBRAvIBxnjZLxklVuQ')
          .collection('storiesCategory');

        const querySnapshot = await storiesCategoryRef.get();
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategoriesData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories: ', error);
    }
  };

  const fetchBooksByCategory = async (category) => {
    try {
      if (!user) return;

      const storiesCategoryRef = fireDB
        .collection('categories')
        .doc('MNfBRAvIBxnjZLxklVuQ')
        .collection('storiesCategory');

      const categoryQuerySnapshot = await storiesCategoryRef
        .where('strCategory', '==', category || activeCategory)
        .get();

      if (categoryQuerySnapshot.empty) return;

      const allBooks = [];
      for (const categoryDoc of categoryQuerySnapshot.docs) {
        const booksRef = storiesCategoryRef.doc(categoryDoc.id).collection('Books');
        const booksSnapshot = await booksRef.get();
        if (!booksSnapshot.empty) {
          const booksData = booksSnapshot.docs.map(bookDoc => ({ id: bookDoc.id, ...bookDoc.data() }));
          allBooks.push(...booksData);
        }
      }

      setBooks(allBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarusername}>
          <Text style={styles.avatarText}>Vedas</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
            <MaterialIcons name="notifications-none" size={wp(8)} color="white" />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image 
                style={{ width: wp(8), height: wp(8), marginLeft: wp(2) }} 
                source={require('../../assets/images/profile-pic-3.png')} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Video Modal */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            {videoUrl && <Arti toggleModal={toggleModal} videoId={videoUrl} />}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: hp(5) }}>
        
        {/* Categories */}
        {categoriesData && (
          <Categories 
            categoriesData={categoriesData} 
            handlePlayIconPress={handlePlayIconPress} 
            activeCategory={activeCategory} 
            handleChangeCategory={handleChangeCategory} 
          />
        )}

        {/* Greetings / Quotes */}
        <View style={styles.greetingsContainer}>
          <Text style={styles.greetingTextMain}>
            Good<Text style={{ color: '#f59e0b' }}> Reads</Text>
          </Text>

          {Quotes.slice(0, 10).map((q) => (
            <Text key={q.id} style={styles.greetingText}>
              {q.quote}
            </Text>
          ))}
        </View>

        {/* Home Feed */}
        {/* <Homefeed /> */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.Primary,
    paddingHorizontal: wp(4),
    paddingVertical: hp(3.5),
    borderBottomLeftRadius: wp(4),
    borderBottomRightRadius: wp(4),
  },

  avatarusername: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: hp(2.2)
  },

  avatarText: { color: Colors.white, fontSize: hp(3.5), fontWeight: 'bold' },

  greetingsContainer: { marginHorizontal: wp(4), marginTop: hp(3), marginBottom: hp(2), gap: hp(1.5) },

  greetingTextMain: { fontSize: hp(3.5), color: '#4B5563', fontWeight: 'bold' },

  greetingText: { fontSize: hp(2.2), color: '#4B5563', opacity: 0.7, marginBottom: hp(1), lineHeight: hp(3) },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(255, 103, 31, 0.7)', justifyContent: 'center', alignItems: 'center' },
});
