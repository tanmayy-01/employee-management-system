import { StyleSheet } from 'react-native';
import { ILLUSTRATION_HEIGHT, ILLUSTRATION_WIDTH, LOGO_HEIGHT, LOGO_WIDTH, SPACING_ILLUSTRATION_TO_LOGO, SPACING_LOGO_TO_DOTS } from './SplashScreen';



export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF8FF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FAF8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    illustration: {
        width: ILLUSTRATION_WIDTH,
        height: ILLUSTRATION_HEIGHT,
        marginBottom: SPACING_ILLUSTRATION_TO_LOGO,
    },
    logo: {
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
        marginBottom: SPACING_LOGO_TO_DOTS,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#1D61F2',
        marginHorizontal: 3,
    },
    statusText: {
        fontSize: 13,
        color: '#848695',
        fontWeight: '400',
        letterSpacing: 0.1,
    },
});
