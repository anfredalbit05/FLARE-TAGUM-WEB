// src/app/services/firestore.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';

// ---------------------
// Interfaces
// ---------------------
export interface AdminData {
  id: string;
  email: string;
}

export interface FireStationData {
  id: string;
  email: string;
  stationName?: string;       // Optional, as some stations may not have it
  parentStationId?: string;   // Optional for sub-stations
}

export interface DriverData {
  id: string;
  name: string;
  stationId: string;
  role?: string;
}

// ---------------------
// Firestore Service
// ---------------------
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) {}

  // Fetch Admin by email
  async getAdminByEmail(email: string): Promise<AdminData | null> {
    const ref = collection(this.firestore, 'Admin');
    const q = query(ref, where('email', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    return {
      id: snap.docs[0].id,
      ...(snap.docs[0].data() as any)
    };
  }

  // Fetch FireStation by email
  async getFireStationByEmail(email: string): Promise<FireStationData | null> {
    const ref = collection(this.firestore, 'fireStations');
    const q = query(ref, where('email', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    return {
      id: snap.docs[0].id,
      ...(snap.docs[0].data() as any)
    };
  }

  // Fetch all sub-stations for a parent station
  async getSubStationsByParent(parentStationId: string): Promise<FireStationData[]> {
    const ref = collection(this.firestore, 'fireStations');
    const q = query(ref, where('parentStationId', '==', parentStationId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    return snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
  }

  // Fetch all drivers for a specific station
  async getDriversByStation(stationId: string): Promise<DriverData[]> {
    const driversRef = collection(this.firestore, 'drivers');
    const q = query(driversRef, where('stationId', '==', stationId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    const drivers = snap.docs.map(doc => ({
      ...(doc.data() as DriverData),
      id: doc.id  // Ensure doc.id is assigned
    }));

    console.log('Drivers for stationId', stationId, ':', drivers);

    return drivers;
  }

}
