import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {

  constructor(private firestore: Firestore) { }

  async createSponsorship(sponsorship: any): Promise<any> {
    try {
      const sponsorshipRef = collection(this.firestore, 'sponsorships');
      const docRef = await addDoc(sponsorshipRef, sponsorship);
      return docRef.id;
    } catch (error) {
      console.error("Error creating sponsorship: ", error);
      throw error;
    }
  }

  async getAllSponsorshipsBySponsorId(sponsorId: string): Promise<any[]> {
    try {
      const sponsorshipsRef = collection(this.firestore, 'sponsorships');
      const querySnapshot = await getDocs(sponsorshipsRef);
      let sponsorships: any[] = [];
      querySnapshot.forEach((doc) => {
        let sponsorship = doc.data();
        if (sponsorship['sponsorId'] === sponsorId) {
          sponsorship['id'] = doc.id;
          sponsorships.push(sponsorship);
        }
      });
      return sponsorships;
    } catch (error) {
      console.error("Error fetching sponsorships: ", error);
      return [];
    }
  }

  async getAllSponsorshipsByTripId(tripId: string): Promise<any[]> {
    try {
      const sponsorshipsRef = collection(this.firestore, 'sponsorships');
      const querySnapshot = await getDocs(sponsorshipsRef);
      let sponsorships: any[] = [];
      querySnapshot.forEach((doc) => {
        let sponsorship = doc.data();
        if (sponsorship['tripId'] === tripId) {
          sponsorship['id'] = doc.id;
          sponsorships.push(sponsorship);
        }
      });
      return sponsorships;
    } catch (error) {
      console.error("Error fetching sponsorships: ", error);
      return [];
    }
  }
  
}
