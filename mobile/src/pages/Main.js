import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Animated,
    Keyboard,
    Dimensions,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

import MapView, { Marker, Callout } from 'react-native-maps';

import {
    requestPermissionsAsync,
    getCurrentPositionAsync,
} from 'expo-location';

import api from './../services/api';
import {
    connect,
    disconnect,
    subscribeToNewDevs,
} from './../services/socket';

function Main({ navigation }) {
    const [currentRegion, setCurrentRegion] = useState(null);
    const [devs, setDevs] = useState([]);
    const [techs, setTechs] = useState('');

    const [animate, ] = useState(new Animated.Value(0));
    const height = Dimensions.get('window').height;

    useEffect(() => {
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync();

            if (granted) {
                const location = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                });
                const { latitude, longitude } = location.coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                });
            }
        }
        loadInitialPosition();
    }, []);

    useEffect(() => {
        Keyboard.addListener(
            'keyboardDidShow',
            () => {
                Animated.timing(animate, {
                    toValue: -(height-(StatusBar.currentHeight+85)),
                    duration: 200,
                    useNativeDriver: true
                }).start();
            }
        );
        Keyboard.addListener(
            'keyboardDidHide',
            () => {
                Animated.timing(animate, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }).start();
            }
        );
    }, []);

    useEffect(() => {
        subscribeToNewDevs(dev => setDevs([...devs, dev]));
    }, [devs]);

    function setupWebsocket() {
        disconnect();

        const { latitude, longitude } = currentRegion;
        
        connect(
            latitude,
            longitude,
            techs
        );
    }

    async function loadDevs() {
        const { latitude, longitude } = currentRegion;

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        });

        setDevs(response.data);
        setupWebsocket();
    }

    if (!currentRegion) {
        return null;
    }

    function handleRegionChanged(region) {
        setCurrentRegion(region);
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <MapView
                onRegionChange={handleRegionChanged}
                initialRegion={currentRegion}
                style={styles.map}
            >
                {devs.map(dev => (
                    <Marker
                        key={dev._id}
                        coordinate={{
                            longitude: dev.location.coordinates[0],
                            latitude: dev.location.coordinates[1],
                        }}
                    >
                        <Image
                            style={styles.avatar}
                            source={{ uri: dev.avatar_url }}
                        />

                        <Callout onPress={() => {
                            navigation.navigate('Profile', { github_username: dev.github_username, name: dev.name });
                        }}
                        >
                            <View style={styles.callout}>
                                <Text style={styles.devName}> {dev.name} </Text>
                                <Text style={styles.devBio}> {dev.bio} </Text>
                                <Text style={styles.devTechs}> {dev.techs.join(', ')} </Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <Animated.View style={[styles.searchForm, 
                {
                    transform: [{
                        translateY: animate.interpolate({
                            inputRange: [-(height-(StatusBar.currentHeight+85)), 0, 10],
                            outputRange: [-(height-(StatusBar.currentHeight+85)), 0, 10],
                            extrapolate: 'clamp',
                        }),
                    }],
                },
            ]}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar devs por techs"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={techs}
                    onChangeText={setTechs}
                    autoFocus={false}
                />
                <TouchableOpacity
                    style={styles.loadButton}
                    onPress={loadDevs}
                >
                    <MaterialIcons name="near-me" size={20} color="#fff" />

                </TouchableOpacity>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },

    avatar: {
        width: 54,
        height: 54,
        borderRadius: 108,
        resizeMode: 'contain'
    },

    callout: {
        width: 260
    },

    devName: {
        fontWeight: 'bold',
        fontSize: 16,
    },

    devBio: {
        color: '#666',
        marginTop: 5,
    },

    devTechs: {
        marginTop: 5,
    },

    searchForm: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4,
        },
        elevation: 2,
    },

    loadButton: {
        height: 50,
        width: 50,
        backgroundColor: '#8e4dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
})

export default Main;