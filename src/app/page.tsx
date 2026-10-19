"use client";

import React, { useState, useEffect } from 'react';
import { EmployeeProvider, useEmployee, RouteStop } from '../context/EmployeeContext';
import { MobileFrameShell } from '../components/layout/MobileFrameShell';
import { BottomNavBar } from '../components/layout/BottomNavBar';
import { HomeScreen } from '../components/home/HomeScreen';
import { MyPickupsScreen } from '../components/pickups/MyPickupsScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { LiveRouteNavigationScreen } from '../components/navigation/LiveRouteNavigationScreen';
import { IncomingPickupAlertModal } from '../components/navigation/IncomingPickupAlertModal';
import { ScanCustomerQrScreen } from '../components/verification/ScanCustomerQrScreen';
import { PickupVerifiedScreen } from '../components/verification/PickupVerifiedScreen';
import { AddScrapCatalogScreen } from '../components/collection/AddScrapCatalogScreen';
import { AddedItemsWeightScreen } from '../components/collection/AddedItemsWeightScreen';
import { EditPickupDetailsScreen } from '../components/collection/EditPickupDetailsScreen';
import { CustomerReviewScreen } from '../components/collection/CustomerReviewScreen';
import { CustomerOtpScreen } from '../components/verification/CustomerOtpScreen';
import { PickupCompletedScreen } from '../components/verification/PickupCompletedScreen';
import { ServerDownScreen } from '../components/common/ServerDownScreen';
import { EmployeeLoginScreen } from '../components/auth/EmployeeLoginScreen';
import { fieldOpsApi } from '../services/api';

function EmployeeAppContent() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    isLoadingAuth,
    refreshDashboardData,
    activeTab,
    setActiveTab,
    setActivePickup,
    setShiftStatus,
    isLiveNavOpen,
    setIsLiveNavOpen,
    startLiveNavigation,
    pickupStep,
    setPickupStep,
  } = useEmployee();

  const [isServerDown, setIsServerDown] = useState(false);
  const [serverErrorDetails, setServerErrorDetails] = useState('');
  const [isRetryingServer, setIsRetryingServer] = useState(false);

  useEffect(() => {
    fieldOpsApi.checkHealth();
    const unsub = fieldOpsApi.onServerStatusChange((down, details) => {
      setIsServerDown(down);
      if (details) setServerErrorDetails(details);
    });
    return () => unsub();
  }, []);

  const handleRetryServer = async () => {
    setIsRetryingServer(true);
    await fieldOpsApi.checkHealth();
    setIsRetryingServer(false);
  };

  const handleStartPickupFlow = (pickupCode: string) => {
    setPickupStep('STEP_1_SCAN_QR');
  };

  const handleNavigateToPickup = (stop: RouteStop) => {
    startLiveNavigation(stop);
  };

  if (isServerDown) {
    return (
      <ServerDownScreen
        onRetry={handleRetryServer}
        isRetrying={isRetryingServer}
        errorDetails={serverErrorDetails}
      />
    );
  }

  if (isLoadingAuth) {
    return (
      <MobileFrameShell>
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-300">Loading Asli Kaata Field Ops...</p>
        </div>
      </MobileFrameShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <MobileFrameShell>
        <EmployeeLoginScreen
          onLoginSuccess={async () => {
            setIsAuthenticated(true);
            await refreshDashboardData();
          }}
        />
      </MobileFrameShell>
    );
  }

  return (
    <MobileFrameShell>
      {/* 1. Live Rapido Turn-by-Turn Navigation */}
      {isLiveNavOpen ? (
        <LiveRouteNavigationScreen
          onArrivedAtDoorstep={(stop) => {
            setIsLiveNavOpen(false);
            setPickupStep('STEP_1_SCAN_QR');
          }}
          onExitNavigation={() => setIsLiveNavOpen(false)}
        />
      ) : pickupStep === 'STEP_1_SCAN_QR' ? (
        /* 2. Step 1: Scan Customer QR Viewfinder */
        <ScanCustomerQrScreen
          onScanSuccess={() => setPickupStep('STEP_2_VERIFIED')}
          onCancel={() => setPickupStep('IDLE')}
        />
      ) : pickupStep === 'STEP_2_VERIFIED' ? (
        /* 3. Step 2: Pickup Verified Confirmation */
        <PickupVerifiedScreen
          onContinueToCatalog={() => setPickupStep('STEP_4_CATALOG')}
          onBack={() => setPickupStep('STEP_1_SCAN_QR')}
        />
      ) : pickupStep === 'STEP_4_CATALOG' ? (
        /* 4. Step 4: Add Scrap Catalog Screen */
        <AddScrapCatalogScreen
          onDone={() => setPickupStep('STEP_6_WEIGHTS')}
          onBack={() => setPickupStep('STEP_2_VERIFIED')}
        />
      ) : pickupStep === 'STEP_6_WEIGHTS' ? (
        /* 5. Step 6: Added Items & Digital Weight Entry */
        <AddedItemsWeightScreen
          onCheckoutOverview={() => setPickupStep('STEP_10_REVIEW')}
          onAddMoreScrap={() => setPickupStep('STEP_4_CATALOG')}
          onBack={() => setPickupStep('STEP_4_CATALOG')}
        />
      ) : pickupStep === 'STEP_10_REVIEW' ? (
        /* 6. Step 10: Customer Review Screen */
        <CustomerReviewScreen
          onCustomerConfirmed={() => setPickupStep('STEP_15_OTP')}
          onEditDetails={() => setPickupStep('STEP_11_EDIT')}
          onBack={() => setPickupStep('STEP_6_WEIGHTS')}
        />
      ) : pickupStep === 'STEP_11_EDIT' ? (
        /* 7. Step 11: Edit Pickup Details Screen */
        <EditPickupDetailsScreen
          onSaveChanges={() => setPickupStep('STEP_10_REVIEW')}
          onAddMoreScrap={() => setPickupStep('STEP_4_CATALOG')}
          onBack={() => setPickupStep('STEP_10_REVIEW')}
        />
      ) : pickupStep === 'STEP_15_OTP' ? (
        /* 8. Step 15: Confirm Pickup Completion with Customer OTP */
        <CustomerOtpScreen
          onVerifySuccess={() => setPickupStep('STEP_19_COMPLETED')}
          onBack={() => setPickupStep('STEP_10_REVIEW')}
        />
      ) : pickupStep === 'STEP_19_COMPLETED' ? (
        /* 9. Step 19: Pickup Successfully Completed Voucher */
        <PickupCompletedScreen
          onDone={() => {
            setPickupStep('IDLE');
            setActiveTab('HOME');
          }}
        />
      ) : (
        /* 10. Default Mobile Tab Views with Persistent Bottom Navigation */
        <>
          {activeTab === 'HOME' && (
            <HomeScreen
              onStartPickupFlow={handleStartPickupFlow}
              onNavigateToPickup={handleNavigateToPickup}
            />
          )}

          {activeTab === 'MY_PICKUPS' && (
            <MyPickupsScreen
              onSelectStop={(stop) => {
                setActivePickup(stop);
                setActiveTab('HOME');
              }}
              onNavigateToStop={(stop) => handleNavigateToPickup(stop)}
            />
          )}

          {activeTab === 'PROFILE' && <ProfileScreen />}

          {/* Persistent Mobile Bottom Navigation Bar */}
          <BottomNavBar />
        </>
      )}

      {/* Real-time Uber / Rapido Dispatch Alert Overlay */}
      <IncomingPickupAlertModal />
    </MobileFrameShell>
  );
}

export default function EmployeeAppPage() {
  return (
    <EmployeeProvider>
      <EmployeeAppContent />
    </EmployeeProvider>
  );
}
