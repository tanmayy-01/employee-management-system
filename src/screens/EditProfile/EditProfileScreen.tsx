import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

export const EditProfileScreen: React.FC = () => {
    const { user, navigate } = useAuth();
    const { colors, isDark } = useTheme();

    const [fullName, setFullName] = useState(user?.name || 'Sarah Jenkins');
    const [email, setEmail] = useState(user?.email || 'sarah.j@workpulse.co');
    const [phone, setPhone] = useState('+1 (555) 019-2834');
    const roleAndDepartment = `${user?.role || 'Senior Product Designer'}, ${user?.department || 'Design'}`;
    const [avatarUrl, setAvatarUrl] = useState(
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Photo',
            'Choose an option to update your profile photo:',
            [
                {
                    text: 'Take Photo',
                    onPress: () => {
                        Alert.alert('Camera', 'Camera feature activated.');
                    },
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => {
                        Alert.alert('Gallery', 'Gallery selection activated.');
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleSaveChanges = async () => {
        if (!fullName.trim()) {
            setErrorMessage('Please enter your full name');
            return;
        }
        if (!email.trim()) {
            setErrorMessage('Please enter your email address');
            return;
        }

        setErrorMessage('');
        setIsLoading(true);

        try {
            // Simulate API update request
            await new Promise<void>((resolve) => setTimeout(resolve, 600));

            Alert.alert(
                'Profile Updated',
                'Your profile details have been successfully updated.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigate('Profile'),
                    },
                ]
            );
        } catch {
            setErrorMessage('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('Profile');
    };

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}
            edges={['top', 'left', 'right']}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Top Bar Navigation */}
            <View style={[styles.topBar, { backgroundColor: isDark ? colors.background : '#FAF8FF' }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigate('Profile')}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="arrow-back"
                        size={22}
                        color={isDark ? colors.textPrimary : '#1F2937'}
                    />
                </TouchableOpacity>
                <Text style={[styles.topBarTitle, { color: colors.primary }]}>Edit Profile</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* White / Dark Main Card */}
                    <View
                        style={[
                            styles.mainCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                                shadowColor: colors.shadowColor,
                            },
                        ]}
                    >
                        {/* Profile Photo Section */}
                        <View style={styles.photoContainer}>
                            <View
                                style={[
                                    styles.avatarWrapper,
                                    { borderColor: isDark ? colors.cardBorder : '#FFFFFF' },
                                ]}
                            >
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            </View>
                            <TouchableOpacity
                                style={[styles.cameraBadgeButton, { backgroundColor: colors.primary }]}
                                onPress={handleChangePhoto}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="camera" size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleChangePhoto}
                            activeOpacity={0.7}
                            style={styles.changePhotoBtn}
                        >
                            <Text style={[styles.changePhotoText, { color: colors.primary }]}>
                                Change Photo
                            </Text>
                        </TouchableOpacity>

                        {/* Error Message */}
                        {errorMessage ? (
                            <View
                                style={[
                                    styles.errorBox,
                                    {
                                        backgroundColor: colors.errorBackground,
                                        borderColor: colors.errorBorder,
                                    },
                                ]}
                            >
                                <Text style={[styles.errorText, { color: colors.error }]}>
                                    {errorMessage}
                                </Text>
                            </View>
                        ) : null}

                        {/* Field 1: Full Name */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                                Full Name
                            </Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    value={fullName}
                                    onChangeText={(text) => {
                                        setFullName(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    placeholder="Sarah Jenkins"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Field 2: Email Address */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                                Email Address
                            </Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="mail-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    placeholder="sarah.j@workpulse.co"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                This email is used for login and notifications.
                            </Text>
                        </View>

                        {/* Field 3: Phone Number */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                                Phone Number
                            </Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F8FAFC',
                                        borderColor: colors.inputBorder,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="call-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.inputText }]}
                                    value={phone}
                                    onChangeText={(text) => setPhone(text)}
                                    placeholder="+1 (555) 019-2834"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        {/* Field 4: Role & Department (Disabled / Read-only) */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                                Role & Department
                            </Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.inputDisabled,
                                    {
                                        backgroundColor: isDark
                                            ? colors.inputBackground
                                            : '#F1F5F9',
                                        borderColor: isDark ? colors.inputBorder : '#E2E8F0',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="briefcase-outline"
                                    size={18}
                                    color={colors.iconColor}
                                    style={styles.inputIcon}
                                />
                                <Text
                                    style={[
                                        styles.disabledText,
                                        { color: isDark ? colors.textSecondary : '#64748B' },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {roleAndDepartment}
                                </Text>
                            </View>
                            <View style={styles.infoHelperRow}>
                                <Ionicons
                                    name="information-circle-outline"
                                    size={13}
                                    color={colors.textSecondary}
                                    style={styles.infoIcon}
                                />
                                <Text style={[styles.helperTextNoMargin, { color: colors.textSecondary }]}>
                                    Contact HR to change role details.
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsContainer}>
                            {/* Save Changes Button */}
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    { backgroundColor: colors.primary, shadowColor: colors.primary },
                                    isLoading && styles.buttonDisabled,
                                ]}
                                onPress={handleSaveChanges}
                                disabled={isLoading}
                                activeOpacity={0.85}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                style={[
                                    styles.cancelButton,
                                    {
                                        borderColor: isDark ? colors.cardBorder : '#CBD5E1',
                                        backgroundColor: isDark ? colors.card : '#FFFFFF',
                                    },
                                ]}
                                onPress={handleCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAF8FF',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAF8FF',
    },
    backButton: {
        paddingRight: 10,
        paddingVertical: 4,
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#004AC6',
        letterSpacing: -0.2,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },
    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 22,
        shadowColor: '#1A2A4E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.7)',
    },
    photoContainer: {
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 6,
    },
    avatarWrapper: {
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraBadgeButton: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#004AC6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    changePhotoBtn: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    changePhotoText: {
        fontSize: 12.5,
        fontWeight: '700',
        color: '#004AC6',
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FCA5A5',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 14,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    fieldGroup: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 12.5,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        height: 44,
        paddingHorizontal: 12,
    },
    inputDisabled: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 13.5,
        color: '#1F2937',
        paddingVertical: 0,
    },
    disabledText: {
        flex: 1,
        fontSize: 13.5,
        color: '#64748B',
    },
    helperText: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 4,
        marginLeft: 2,
    },
    infoHelperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: 2,
    },
    infoIcon: {
        marginRight: 4,
    },
    helperTextNoMargin: {
        fontSize: 11,
        color: '#6B7280',
    },
    actionButtonsContainer: {
        marginTop: 10,
        gap: 10,
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#004AC6',
        borderRadius: 10,
        height: 46,
        shadowColor: '#004AC6',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14.5,
        fontWeight: '600',
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        height: 46,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 14.5,
        fontWeight: '600',
    },
});

export default EditProfileScreen;
