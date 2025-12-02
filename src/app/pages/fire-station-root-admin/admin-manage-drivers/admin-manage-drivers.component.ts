import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from '@angular/fire/firestore';

@Component({
  selector: 'app-admin-manage-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage-drivers.component.html',
  styleUrls: ['./admin-manage-drivers.component.css'],
})
export class AdminManageDriversComponent implements AfterViewInit {

  constructor(private firestore: Firestore, private auth: Auth) {
    this.loadStations();
    this.loadDrivers();
  }

  // MODAL
  showModal = false;

  // Add this in AdminManageDriversComponent
  isLoading = false;


  // DRIVER LIST
  driverList: any[] = [];

  // FIRE STATIONS
  stationList: any[] = [];

  // FORM FIELDS
  driverName = '';
  driverEmail = '';
  driverContact = '';
  selectedStationId = '';
  selectedStationName = '';
  status = 'Active';

  ngAfterViewInit() {
    // Nothing special for map here
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  loadStations() {
    const stationsRef = collection(this.firestore, 'fireStations');
    const q = query(stationsRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
      this.stationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  loadDrivers() {
    const driversRef = collection(this.firestore, 'drivers');
    const q = query(driversRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
      this.driverList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  setStationName() {
    const station = this.stationList.find(s => s.id === this.selectedStationId);
    this.selectedStationName = station ? station.stationName : '';
  }

  async saveDriver() {
  // VALIDATION
  if (!this.driverName.trim() || !this.driverEmail.trim() || !this.driverContact.trim() || !this.selectedStationId) {
    alert("Please fill in all required fields.");
    return;
  }

  const confirmSave = confirm("Are you sure you want to save this driver?");
  if (!confirmSave) return;

  // Show loading overlay
  this.isLoading = true;

  try {
    // Generate random password (8 characters)
    const randomPassword = Math.random().toString(36).slice(-8);

    // CREATE AUTH ACCOUNT
    const userCred = await createUserWithEmailAndPassword(
      this.auth,
      this.driverEmail,
      randomPassword
    );
    const user = userCred.user;

    // SEND VERIFICATION EMAIL
    await sendEmailVerification(user, {
      url: 'https://flare-tagum-web-app-51c7a.firebaseapp.com',
      handleCodeInApp: false,
    });

    // FIRESTORE DATA
    const driverData: any = {
      fullName: this.driverName,
      email: this.driverEmail,
      contact: this.driverContact,
      stationId: this.selectedStationId,
      stationName: this.selectedStationName,
      status: this.status,
      authUid: user.uid,
      createdAt: new Date(),
      password: randomPassword // Optional: store hashed password if needed
    };

    const driversRef = collection(this.firestore, 'drivers');
    await addDoc(driversRef, driverData);

    alert("Driver Created! Verification email sent.");
    this.closeModal();
    this.resetForm();

  } catch (error: any) {
    console.error(error);
    alert(error.message);
  } finally {
    // Hide loading overlay
    this.isLoading = false;
  }
}


  resetForm() {
    this.driverName = '';
    this.driverEmail = '';
    this.driverContact = '';
    this.selectedStationId = '';
    this.selectedStationName = '';
    this.status = 'Active';
  }
}
