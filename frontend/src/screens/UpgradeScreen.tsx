// src/screens/UpgradeScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { CHECKOUT_LINK } from '../config/stripe';

export default function UpgradeScreen() {
  const [loading, setLoading] = React.useState(true);

  const redirectToPayment = async () => {
    await Linking.openURL(CHECKOUT_LINK);
    setLoading(false);
  };

  useEffect(() => {
    redirectToPayment();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Redirecting to the payment page..</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>If it does not automatically redirect, please click the button below</Text>
      <Button title="Go to pay" onPress={redirectToPayment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { marginVertical: 12, fontSize: 16, textAlign: 'center' },
});
