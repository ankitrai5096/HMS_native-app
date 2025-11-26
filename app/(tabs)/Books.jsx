import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import RecommnededBooks from '../../components/RecommnededBooks';
import { auth, fireDB } from '../../Configs/FirebaseConfig';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import CategoryTags from '../../components/CategoryTags';

export default function HomeScreen() {
  const currentUser = useSelector((state) => state.auth.user);
  const user = auth().currentUser;

  const [categoriesData, setCategoriesData] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Mahadev');
  const [searchText, setSearchText] = useState("");

  const navigation = useNavigation();
  const playerRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchBooksByCategory();
  }, [currentUser]);

  const handleChangeCategory = (category) => {
    fetchBooksByCategory(category);
    setActiveCategory(category);
    setBooks([]);
  };

  const fetchCategories = async () => {
    try {
      if (user) {
        const storiesCategoryRef = fireDB
          .collection('categories')
          .doc('MNfBRAvIBxnjZLxklVuQ')
          .collection('storiesCategory');

        const querySnapshot = await storiesCategoryRef.get();

        if (querySnapshot.empty) {
          console.log('No documents found in the storiesCategory collection!');
          return;
        }

        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategoriesData(categoriesData);
      } else {
        console.log('No user is logged in.');
      }
    } catch (error) {
      console.error('Error fetching categories: ', error);
    }
  };

  const fetchBooksByCategory = async (category) => {
    try {
      if (user) {
        const storiesCategoryRef = fireDB
          .collection('categories')
          .doc('MNfBRAvIBxnjZLxklVuQ')
          .collection('storiesCategory');

        const categoryQuerySnapshot = await storiesCategoryRef
          .where('strCategory', '==', category || activeCategory)
          .get();

        if (categoryQuerySnapshot.empty) {
          console.log(`No category found for '${category}'`);
          return;
        }

        const allBooks = [];
        for (const categoryDoc of categoryQuerySnapshot.docs) {
          const booksRef = storiesCategoryRef
            .doc(categoryDoc.id)
            .collection('Books');

          const booksSnapshot = await booksRef.get();

          if (booksSnapshot.empty) {
            console.log('No books found in the Books subcollection!');
            continue;
          }

          const booksData = booksSnapshot.docs.map((bookDoc) => ({
            id: bookDoc.id,
            ...bookDoc.data(),
          }));

          allBooks.push(...booksData);
        }

        setBooks(allBooks);
      } else {
        console.log("user not authenticated");
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Filter books for search
  const filteredBooks = books.filter((book) =>
    book.bookName?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder='Search a book here...'
            placeholderTextColor={"#fff"}
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            style={{ 
              flex: 1, 
              fontSize: hp(2), 
              fontWeight: 'bold', 
              color: "white" 
            }}
          />
          <MagnifyingGlassIcon size={hp(2.3)} strokeWidth={3} color={'#fff'} />
        </View>

        {/* Categories */}
        <View style={styles.line} />
        <View>
          {categoriesData && (
            <CategoryTags 
              categoriesData={categoriesData}  
              activeCategory={activeCategory} 
              handleChangeCategory={handleChangeCategory} 
            />
          )}
        </View>

        {/* Books */}
        <View>
          {filteredBooks.length > 0 ? (
            <RecommnededBooks books={filteredBooks} categoriesData={categoriesData} />
          ) : (
            <Text style={styles.noResults}>No books found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    marginTop: hp(5),
    paddingBottom: hp(5),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    backgroundColor: Colors.Primary,
    justifyContent: 'space-between',
    padding: hp(1.5),
    borderRadius: wp(5),
    marginHorizontal: wp(3),
    paddingHorizontal: wp(4),
  },
  line: {
    marginVertical: hp(1),
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    opacity: 0.5,
  },
  noResults: {
    textAlign: 'center',
    fontSize: hp(2),
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: hp(5),
  },
});
