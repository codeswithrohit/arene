import React,{useState,useEffect,useRef} from 'react'
import Link from 'next/link';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FaCamera, FaHeart, FaStar, FaBed, FaBath, FaHome, FaSms, FaPhone,FaMapMarkerAlt  } from 'react-icons/fa';
import { FaPersonCircleCheck } from 'react-icons/fa6';
import { useRouter } from 'next/router';
import { firebase } from '../Firebase/config';
import 'firebase/firestore';
import 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
const Filter1 = () => {
  const [showFilters, setShowfilters] = useState(false);
  const [check, setCheck] = useState({
    Appartment: false,
    BuilderFloor: false,
    Villas: false,
    Land: false,
    ShopShowroom: false,
    OfficeSpace: false,
    OtherProperties: false,
    fabric: false,
    crocodile: false,
    wool: false,
    SingleRoom: false,
    DoubleSharingRoom: false,
    TripleSharingRoom: false,
    SingleAcRoom: false,
    DoubleSharingAcRoom: false,
    TripleSharingAcRoom: false,
    luxesignatire: false,
    luxelondon: false,
  });

  const { Appartment, BuilderFloor,Villas,Land,OtherProperties,ShopShowroom,OfficeSpace, fabric, crocodile, wool, SingleRoom, DoubleSharingRoom, TripleSharingRoom, SingleAcRoom,DoubleSharingAcRoom,TripleSharingAcRoom, luxesignatire, luxelondon } = check;
  const changeHandler = (e) => {
    setCheck({
      ...check,
      [e.target.name]: e.target.checked,
    });
  };

  const applyFilters = (e) => {
    // Apply filters based on both distance, price range, and room type
    const filteredData = fetchedData.filter((item) => {
      // Filter based on distance
      const isWithinDistance = parseFloat(item.distance) < parseFloat("5000");
  
      // Filter based on price within roomtype
      const roomTypePrices = item.roomTypes.map((roomType) => parseFloat(roomType.price));
      const isPriceInRange = roomTypePrices.some((roomPrice) => roomPrice >= minPrice && roomPrice <= price);
  
      // Filter based on subcategory
    //   const subCategoryFilter = (Appartment && item.subcat === "Appartment") || (BuilderFloor && item.subcat === "Builder Floor") || (Villas && item.subcat === "Villas") || (Land && item.subcat === "Land") || (ShopShowroom && item.subcat === "Shop/Showroom") || (OfficeSpace && item.subcat === "OfficeSpace") || (OtherProperties && item.subcat === "Other Properties");
  
    //   Filter based on room types
      const roomTypeFilter = item.roomTypes.some((roomType) => {
        if (SingleRoom && roomType.type === "Single Room") return true;
        if (DoubleSharingRoom && roomType.type === "Double Sharing Room") return true;
        if (TripleSharingRoom && roomType.type === "Triple Sharing Room") return true;
        if (SingleAcRoom && roomType.type === "Single Ac Room") return true;
        if (DoubleSharingAcRoom && roomType.type === "Double Sharing Ac Room") return true;
        if (TripleSharingAcRoom && roomType.type === "Triple Sharing Ac Room") return true;
        return false;
      });
  
      return isWithinDistance && isPriceInRange && roomTypeFilter ;
    });
  
    setFilteredData(filteredData);
    setShowfilters(false); // Close filter section after applying filters
  };
  
  
  

  const [price, setPrice] = useState(500);

  const updatePrice = (value) => {
    setPrice(value);
  };

  const minPrice = 500; // Define min price
  const maxPrice = 60000; // Define max price

    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [flatTypeFilter, setFlatTypeFilter] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [fetchedData, setFetchedData] = useState([]);
    const [priceRangeFilter, setPriceRangeFilter] = useState('');
    // Extracting the parameters from the URL query
    const [buydata, setBuyData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { location } = router.query;

  

  
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Replace 'yourCollectionName' with the actual collection name
          const collectionRef = firebase.firestore().collection('Hoteldetail').where('Verfied', '==', 'true');
    
          // Get all documents from the collection
          const querySnapshot = await collectionRef.get();
    
          // Extract the data from the documents along with document IDs
          const data = querySnapshot.docs.map((doc) => {
            const userData = doc.data();
            return {
              id: doc.id, // Add document ID to the data
              ...userData,
              distance: null, // Initially set distance as null
            };
          });
    
          // Set the fetched data to the state
          setFetchedData(data);
    
          // Calculate distances for each item
          const distances = await Promise.all(
            data.map(async (item) => {
              const formattedDistance = await calculateDistance(location, item.location);
              console.log(formattedDistance);
              return formattedDistance;
            })
          );
    
          // Update the distances in fetchedData
          const updatedData = data.map((item, index) => ({
            ...item,
            distance: distances[index],
          }));
    
          // Set the updated fetched data to the state
          setFetchedData(updatedData);
          setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
          console.error('Error fetching data:', error);
        
          setLoading(false); // Set loading to false in case of error
        }
      };
    
      fetchData(); // Call the function to fetch data
    }, [location]);
    
    const calculateDistance = (location1, location2) => {
      return new Promise((resolve, reject) => {
        if (location1.trim() !== '' && location2.trim() !== '') {
          const service = new window.google.maps.DistanceMatrixService();
          service.getDistanceMatrix(
            {
              origins: [location1],
              destinations: [location2],
              travelMode: 'DRIVING',
            },
            (response, status) => {
              if (status === 'OK' && response.rows && response.rows.length > 0 && response.rows[0].elements && response.rows[0].elements.length > 0) {
                const { distance } = response.rows[0].elements[0];
                if (distance) {
                  const distanceValue = distance.value; // Distance in meters
                  const distanceKm = distanceValue / 1000; // Convert distance to kilometers
                  const formattedDistance = `${distance.text}`; // Construct the desired format
                  console.log('Distance:', formattedDistance);
                  resolve(formattedDistance);
                }
              } else {
                console.log('Error:', status);
                reject(null);
              }
            }
          );
        } else {
          console.log('Please enter both locations.');
          reject(null);
        }
      });
    };
  
    // Filter fetchedData based on distances less than 15 km
    useEffect(() => {
      // Filter fetchedData based on distances less than 15 km
      const filteredData = fetchedData.filter(item => parseFloat(item.distance) < parseFloat("5000"));
  
      console.log(filteredData);
      setFilteredData(filteredData);
    }, [fetchedData]);
  
   console.log(filteredData)


   const TotalData=filteredData.length
    
   const onViewMapClick = (location) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${location}`, '_blank');
  };

    return (
        <div className="px-8 min-h-screen ">
        <Head>
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyB6gEq59Ly20DUl7dEhHW9KgnaZy4HrkqQ&libraries=places`}
            async
            defer
          ></script>
          
        </Head>
          <div className="2xl:container 2xl:mx-auto">
              <div className=" md:mt-16 lg:px-20 md:px-6 mt-9 px-4">
                  <p className=" text-sm leading-3 text-gray-600 font-normal mb-2">Home - <p>Hotel Property</p></p>
                  <div className=" flex justify-between items-center mb-4">
                  <h2 className=" lg:text-2xl text-xl lg:leading-9 leading-7 text-gray-800 font-semibold">Searching You Property Nearest from {location}</h2>
  
                      {/*  filters Button (md and plus Screen) */}
                      <button onClick={() => setShowfilters(!showFilters)} className=" cursor-pointer sm:flex hidden hover:bg-gray-700 focus:ring focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-4 px-6 bg-gray-800 flex text-base leading-4 font-normal text-white justify-center items-center ">
                          <svg className=" mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 12C7.10457 12 8 11.1046 8 10C8 8.89543 7.10457 8 6 8C4.89543 8 4 8.89543 4 10C4 11.1046 4.89543 12 6 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 4V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 12V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 14 12 14C10.8954 14 10 14.8954 10 16C10 17.1046 10.8954 18 12 18Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 4V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 18V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M18 9C19.1046 9 20 8.10457 20 7C20 5.89543 19.1046 5 18 5C16.8954 5 16 5.89543 16 7C16 8.10457 16.8954 9 18 9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M18 4V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M18 9V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Filters
                      </button>
                  </div>
                  <p className=" text-xl leading-5 text-gray-600 font-medium">{TotalData} Hotel Property</p>
  
                  {/* Filters Button (Small Screen)  */}
  
                  <button onClick={() => setShowfilters(!showFilters)} className="cursor-pointer mt-6 block sm:hidden hover:bg-gray-700 focus:ring focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-2 w-full bg-gray-800 flex text-base leading-4 font-normal text-white justify-center items-center">
                      <svg className=" mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 12C7.10457 12 8 11.1046 8 10C8 8.89543 7.10457 8 6 8C4.89543 8 4 8.89543 4 10C4 11.1046 4.89543 12 6 12Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 4V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 12V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 14 12 14C10.8954 14 10 14.8954 10 16C10 17.1046 10.8954 18 12 18Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 4V14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 18V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 9C19.1046 9 20 8.10457 20 7C20 5.89543 19.1046 5 18 5C16.8954 5 16 5.89543 16 7C16 8.10457 16.8954 9 18 9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 4V5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 9V20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Filters
                  </button>
              </div>
  
              <div id="filterSection" className={"relative md:py-10 lg:px-20 md:px-6 py-9 px-4 bg-gray-50 w-full " + (showFilters ? "block" : "hidden")}>
                  {/* Cross button Code  */}
                  <div onClick={() => setShowfilters(false)} className=" cursor-pointer absolute right-0 top-0 md:py-10 lg:px-20 md:px-6 py-9 px-4">
                      <svg className=" lg:w-6 lg:h-6 w-4 h-4" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M25 1L1 25" stroke="#1F2937" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1 1L25 25" stroke="#27272A" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                  </div>
  
                  {/* Price Section */}
                  <div>
                      <div className=" flex space-x-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 3H15C14.4696 3 13.9609 3.21071 13.5858 3.58579C13.2107 3.96086 13 4.46957 13 5V17C13 18.0609 13.4214 19.0783 14.1716 19.8284C14.9217 20.5786 15.9391 21 17 21C18.0609 21 19.0783 20.5786 19.8284 19.8284C20.5786 19.0783 21 18.0609 21 17V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3Z" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12.9994 7.35022L10.9994 5.35022C10.6243 4.97528 10.1157 4.76465 9.58539 4.76465C9.05506 4.76465 8.54644 4.97528 8.17139 5.35022L5.34339 8.17822C4.96844 8.55328 4.75781 9.06189 4.75781 9.59222C4.75781 10.1225 4.96844 10.6312 5.34339 11.0062L14.3434 20.0062" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M7.3 13H5C4.46957 13 3.96086 13.2107 3.58579 13.5858C3.21071 13.9609 3 14.4696 3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H17" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M17 17V17.01" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className=" lg:text-2xl text-xl lg:leading-6 leading-5 font-medium text-gray-800 ">Price range</p>
                      </div>
                      <div className="mb-4 mt-4">
          <input
            type="range"
            id="price-range"
            className="w-full accent-[#10b981]"
            min={minPrice} // Set min price dynamically
            max={maxPrice} // Set max price dynamically
            value={price}
            onChange={(e) => updatePrice(e.target.value)}
          />
        </div>
        <div className="flex justify-between text-gray-500">
          <span id="minPrice">₹{minPrice}</span>
          <span id="curHotelPrice">₹{price}</span> {/* Display curHotel price */}
          <span id="maxPrice">₹{maxPrice}</span>
        </div>
                  </div>
  
                
  
                  <hr className=" bg-gray-200 lg:w-12/12 w-full md:my-10 my-8" />
  
                  {/* Size Section */}
                  <div>
                      <div className=" flex space-x-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 5H14" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 7L14 5L12 3" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5 3L3 5L5 7" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M19 10V21" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M17 19L19 21L21 19" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M21 12L19 10L17 12" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 10H5C3.89543 10 3 10.8954 3 12V19C3 20.1046 3.89543 21 5 21H12C13.1046 21 14 20.1046 14 19V12C14 10.8954 13.1046 10 12 10Z" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="  lg:text-2xl text-xl lg:leading-6 leading-5 font-Double Sharing Room text-gray-800 ">Room </p>
                      </div>
                      <div className=" md:flex md:space-x-6 mt-8 grid grid-cols-3 gap-y-8 flex-wrap">
                          <div className=" flex md:justify-center md:items-center items-center justify-start ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Single Room" name="SingleRoom" value="Single Room" checked={SingleRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Single Room">
                                          Single Room
                                      </label>
                                  </div>
                              </div>
                          </div>
                          <div className=" flex justify-center items-center ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Double Sharing Room" name="DoubleSharingRoom" value="Double Sharing Room" checked={DoubleSharingRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Double Sharing Room">
                                          Double Sharing Room
                                      </label>
                                  </div>
                              </div>
                          </div>
                          <div className=" flex md:justify-center md:items-center items-center justify-end ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Triple Sharing Room" name="TripleSharingRoom" value="Triple Sharing Room" checked={TripleSharingRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Triple Sharing Room">
                                          Triple Sharing Room
                                      </label>
                                  </div>
                              </div>
                          </div>
                          <div className=" flex md:justify-center md:items-center items-center justify-start ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Single Ac Room" name="SingleAcRoom" value="Single Ac Room" checked={SingleAcRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Single Ac Room">
                                          Single Ac Room
                                      </label>
                                  </div>
                              </div>
                          </div>
  
                          <div className=" flex md:justify-center md:items-center items-center justify-start ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Double Sharing Ac Room" name="DoubleSharingAcRoom" value="Double Sharing Ac Room" checked={DoubleSharingAcRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Double Sharing Ac Room">
                                      Double Sharing Ac Room
                                      </label>
                                  </div>
                              </div>
                          </div>
  
                          <div className=" flex md:justify-center md:items-center items-center justify-start ">
                              <input className="w-4 h-4 mr-2" type="checkbox" id="Triple Sharing Ac Room" name="TripleSharingAcRoom" value="Triple Sharing Ac Room" checked={TripleSharingAcRoom} onChange={changeHandler} />
                              <div className=" inline-block">
                                  <div className=" flex space-x-6 justify-center items-center">
                                      <label className=" mr-2 text-sm leading-3 font-normal text-gray-600" htmlFor="Triple Sharing Ac Room">
                                      Triple Sharing Ac Room
                                      </label>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
  
                  <hr className=" bg-gray-200 lg:w-6/12 w-full md:my-10 my-8" />
  
                
  
                  <div className="px-0 mt-10 w-full md:w-auto md:mt-0 md:absolute md:right-0 md:bottom-0 md:py-10 lg:px-20 md:px-6">
                      <button onClick={applyFilters} className="w-full hover:bg-gray-700 focus:ring focus:ring-offset-2 focus:ring-gray-800 text-base leading-4 font-medium py-4 px-10 text-white bg-gray-800">
                          Apply Filter
                      </button>
                  </div>
              </div>
          </div>
  
          <section className="listing-grid-area pt-15 pb-1">
          <div className="container">
           
          <div className="flex justify-center items-center min-h-screen">
    <div className="row">
      {loading ? ( // Show spinner while loading
        <div className="flex justify-center items-center">
          <img className="w-20 h-20 animate-spin" src="https://www.svgrepo.com/show/70469/loading.svg" alt="Loading icon"/>
        </div>
      ) : (
        filteredData.length === 0 ? (
          <div className="flex justify-center items-center">
            <p className="text-2xl text-gray-600">No Data</p>
          </div>
        ) : (
          filteredData
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)) // Sort data based on distance
            .map((item, index) => (
              <div key={item.id} className="col-lg-8 col-md-12 col-sm-24">
              <div 
    className="listing-item listing-grid-one mb-45 wow fadeInUp"
    data-wow-delay="10ms"
  >
                  <div className="listing-thumbnail">
                      
  
                  <Carousel showThumbs={false} autoPlay>
              {item.imgSrc.map((src, idx) => (
                <div key={idx}>
                  <img
                    src={src}
                    className="w-full h-64 lg:object-cover rounded-md"
                    style={{ objectFit: 'cover' }}
                    alt={`Image ${idx}`}
                  />
                </div>
              ))}
            </Carousel>
                    {/* <span className="featured-btn">{item.subcat} Property</span> */}
                  
                  </div>
                  <div className="listing-content">
                    <h3 className="title">
                      <Link href={`/hoteldetail?id=${item.id}`}>
                        <a>{item.HotelName}</a>
                      </Link>
                    </h3>
                    <div className="ratings">
                      <ul className="ratings ratings-three">
                        <li className="star">
                          <i className="flaticon-star-1"></i>
                        </li>
                        <li className="star">
                          <i className="flaticon-star-1"></i>
                        </li>
                        <li className="star">
                          <i className="flaticon-star-1"></i>
                        </li>
                        <li className="star">
                          <i className="flaticon-star-1"></i>
                        </li>
                        <li className="star">
                          <i className="flaticon-star-1"></i>
                        </li>
                        <li>
                          <span>
                            <a href="#">(02 Reviews)</a>
                          </span>
                        </li>
                      </ul>
                    </div>
                
            
  
  
  {item.roomTypes && item.roomTypes.map((property, i) => (
     <div key={i}>
     <span className="price text-xs">{i + 1}. {property.type} - {property.price}/Month</span>
  </div>
  ))}
  
                    <span className="phone-meta">
                      <i className="ti-tablet"></i>
                      <a href="tel:+919871713129">+919871713129</a>
                    </span>
                    <div className="listing-meta">
                      <ul>
                        <li>
                        <span>
          <i className="ti-location-pin"></i>
          {item.location.split(',')[item.location.split(',').length - 4]},{item.location.split(',')[item.location.split(',').length - 3]}, {item.location.split(',')[item.location.split(',').length - 2]}, {item.location.split(',')[item.location.split(',').length - 1]}
        </span>
                        </li>
                        <li>
                          <span>
                          <p className="flex capitalize items-center text-sm text-emerald-500 font-bold"> {item.distance} <span className="relative inline-flex rounded-md shadow-sm ml-2"><span className="flex absolute h-2 w-2 top-0 right-0 -mt-1 -mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span></span></p>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                </div>
            ))
        )
      )}
    </div>
  </div>
  
  
          </div>
          
        </section>
          </div>
    );
};

export default Filter1;
