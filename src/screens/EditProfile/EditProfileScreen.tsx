import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
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
import { employeeService } from '../../services/employee.service';
import { styles } from './EditProfile.styles';

export const EditProfileScreen: React.FC = () => {
    const { user, navigate, updateUserProfile, authError, clearAuthError } = useAuth();
    const { colors, isDark } = useTheme();

    const [fullName, setFullName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const roleAndDepartment = `${user?.role || 'Employee'}, ${user?.department || 'General'}`;
    const [avatarUrl, setAvatarUrl] = useState(
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    );

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    React.useEffect(() => {
        const loadEmployeeDetails = async () => {
            if (!user?.id && !user?.email) return;
            try {
                const emp =
                    (user?.id ? await employeeService.getEmployeeById(user.id) : null) ||
                    (user?.email ? await employeeService.getEmployeeByEmail(user.email) : null);
                if (emp) {
                    if (emp.name) setFullName(emp.name);
                    if (emp.email) setEmail(emp.email);
                    if (emp.phone) setPhone(emp.phone);
                    if (emp.avatarUrl) setAvatarUrl(emp.avatarUrl);
                }
            } catch (e) {
                console.warn('Failed to load employee details in EditProfile:', e);
            }
        };
        loadEmployeeDetails();
    }, [user]);

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

        setErrorMessage('');
        clearAuthError();
        setIsLoading(true);

        try {
            const success = await updateUserProfile({
                name: fullName.trim(),
                phone: phone.trim(),
                avatarUrl,
            });

            if (success) {
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
            } else {
                setErrorMessage(authError || 'Failed to update profile. Please try again.');
            }
        } catch (err: any) {
            setErrorMessage(err?.message || 'Failed to update profile. Please try again.');
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

                        {/* Field 2: Email Address (Read-only / Managed by Auth) */}
                        <View style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                                Email Address
                            </Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    styles.inputDisabled,
                                    {
                                        backgroundColor: isDark ? colors.inputBackground : '#F1F5F9',
                                        borderColor: isDark ? colors.inputBorder : '#E2E8F0',
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
                                    style={[styles.input, { color: isDark ? colors.textSecondary : '#64748B' }]}
                                    value={email}
                                    editable={false}
                                    placeholder="user@workpulse.co"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                                Email address is linked to your WorkPulse account.
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



export default EditProfileScreen;
