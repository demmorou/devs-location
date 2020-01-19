import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Main from './pages/Main';
import Profile from './pages/Profile';

const Routes = createAppContainer(
    createStackNavigator({
        Main: {
            screen: Main,
            navigationOptions: {
                headerShown: false
            }
        },
        Profile: {
            screen: Profile,
            navigationOptions: ({ navigation }) => {
                    return {
                    title: navigation.getParam('name'),
                    headerTitleAlign: 'center',
                }
            }
        },
    },
    {
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: '#7d40e7',
            },
            headerTintColor: '#fff',
        }
    }
    )
);

export default Routes;