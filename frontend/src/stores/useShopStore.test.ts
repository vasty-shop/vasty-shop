/**
 * Shop Store Tests
 * Basic tests to verify shop store functionality
 */

import { useShopStore } from './useShopStore';
import type { VendorShop } from '@/features/vendor-auth/types';

// Mock shop data
const mockShop1: VendorShop = {
  id: 'shop-1',
  name: 'Test Shop 1',
  slug: 'test-shop-1',
  status: 'active',
  isVerified: true,
  totalProducts: 10,
  totalOrders: 50,
  totalSales: 1000,
  rating: 4.5,
};

const mockShop2: VendorShop = {
  id: 'shop-2',
  name: 'Test Shop 2',
  slug: 'test-shop-2',
  status: 'active',
  isVerified: false,
  totalProducts: 5,
  totalOrders: 20,
  totalSales: 500,
  rating: 4.0,
};

/**
 * Test: Set and Get Current Shop
 */
export const testSetCurrentShop = () => {
  console.log('Testing setCurrentShop...');

  const store = useShopStore.getState();
  store.setCurrentShop(mockShop1);

  const currentShop = useShopStore.getState().currentShop;

  if (currentShop?.id === mockShop1.id && currentShop?.name === mockShop1.name) {
    console.log('✓ setCurrentShop test passed');
    return true;
  } else {
    console.error('✗ setCurrentShop test failed');
    return false;
  }
};

/**
 * Test: Set Shops List
 */
export const testSetShops = () => {
  console.log('Testing setShops...');

  const store = useShopStore.getState();
  store.setShops([mockShop1, mockShop2]);

  const shops = useShopStore.getState().shops;

  if (shops.length === 2 && shops[0].id === mockShop1.id && shops[1].id === mockShop2.id) {
    console.log('✓ setShops test passed');
    return true;
  } else {
    console.error('✗ setShops test failed');
    return false;
  }
};

/**
 * Test: Switch Shop
 */
export const testSwitchShop = () => {
  console.log('Testing switchShop...');

  const store = useShopStore.getState();

  // First set up shops
  store.setShops([mockShop1, mockShop2]);
  store.setCurrentShop(mockShop1);

  // Now switch to shop 2
  store.switchShop('shop-2');

  const currentShop = useShopStore.getState().currentShop;

  if (currentShop?.id === mockShop2.id) {
    console.log('✓ switchShop test passed');
    return true;
  } else {
    console.error('✗ switchShop test failed');
    return false;
  }
};

/**
 * Test: Switch to Non-existent Shop
 */
export const testSwitchToInvalidShop = () => {
  console.log('Testing switchShop with invalid ID...');

  const store = useShopStore.getState();
  store.setShops([mockShop1, mockShop2]);

  // Try to switch to non-existent shop
  store.switchShop('shop-999');

  const error = useShopStore.getState().error;

  if (error && error.includes('not found')) {
    console.log('✓ switchShop error handling test passed');
    return true;
  } else {
    console.error('✗ switchShop error handling test failed');
    return false;
  }
};

/**
 * Test: Clear Shop Context
 */
export const testClearShopContext = () => {
  console.log('Testing clearShopContext...');

  const store = useShopStore.getState();

  // Set up some data
  store.setShops([mockShop1, mockShop2]);
  store.setCurrentShop(mockShop1);

  // Clear context
  store.clearShopContext();

  const state = useShopStore.getState();

  if (state.currentShop === null && state.shops.length === 0 && !state.error) {
    console.log('✓ clearShopContext test passed');
    return true;
  } else {
    console.error('✗ clearShopContext test failed');
    return false;
  }
};

/**
 * Run All Tests
 */
export const runAllShopStoreTests = () => {
  console.log('=== Running Shop Store Tests ===\n');

  const results = [
    testSetCurrentShop(),
    testSetShops(),
    testSwitchShop(),
    testSwitchToInvalidShop(),
    testClearShopContext(),
  ];

  const passed = results.filter(Boolean).length;
  const total = results.length;

  console.log(`\n=== Test Results: ${passed}/${total} passed ===`);

  return { passed, total, success: passed === total };
};

// Export for manual testing in console
if (typeof window !== 'undefined') {
  (window as any).shopStoreTests = {
    runAll: runAllShopStoreTests,
    testSetCurrentShop,
    testSetShops,
    testSwitchShop,
    testSwitchToInvalidShop,
    testClearShopContext,
  };
}
