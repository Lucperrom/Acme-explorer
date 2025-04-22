import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs,addDoc, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Sponsorship } from '../models/sponsorship.model';

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {

  constructor(private firestore: Firestore) { }
    getCurrentSponsorshipFromDoc(doc: any): Sponsorship {
      const data = doc.data();
      let sponsorship = new Sponsorship();
      sponsorship.id = doc.id;
      sponsorship.url = data['url'];
      sponsorship.link = data['link'];
      sponsorship.tripId = data['tripId'];
      sponsorship.sponsorId = data['sponsorId'];
      sponsorship.rate = data['rate']; 
      sponsorship.payed = data['payed']; 
      return sponsorship;
    }

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
    async getAllSponsorships(): Promise<Sponsorship[]> {
      try {
        const tripsRef = collection(this.firestore, 'sponsorships');
        const querySnapshot = await getDocs(tripsRef);
  
        let sponsorships: Sponsorship[] = [];
        querySnapshot.forEach((doc) => {
          let sponsorship = this.getCurrentSponsorshipFromDoc(doc);
            sponsorships.push(sponsorship);
        });
  
        return sponsorships;
      } catch (error) {
        console.error("Error fetching trips:", error);
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
  async getSponsorshipById(id: string): Promise<any> {
    try {
      const sponsorshipDocRef = doc(this.firestore, 'sponsorships', id);
      const sponsorshipSnapshot = await getDoc(sponsorshipDocRef);
      if (sponsorshipSnapshot.exists()) {
        return { id: sponsorshipSnapshot.id, ...sponsorshipSnapshot.data() };
      } else {
        throw new Error('Sponsorship not found');
      }
    } catch (error) {
      console.error("Error fetching sponsorship by ID: ", error);
      throw error;
    }
  }

  async updateSponsorship(id: string, updatedData: any): Promise<void> {
    try {
      const sponsorshipDocRef = doc(this.firestore, 'sponsorships', id);
      await updateDoc(sponsorshipDocRef, updatedData);
    } catch (error) {
      console.error("Error updating sponsorship: ", error);
      throw error;
    }
  }

  async removeSponsorship(id: string): Promise<void> {
    try {
      const sponsorshipDocRef = doc(this.firestore, 'sponsorships', id);
      await deleteDoc(sponsorshipDocRef);
    } catch (error) {
      console.error("Error deleting sponsorship: ", error);
      throw error;
    }
  }

  async hasSponsor(sponsorId: (string | undefined), tripId: (string | null)): Promise<boolean> {
    try {
      const sponsorhipsRef = collection(this.firestore, 'sponsorships');
      const querySnapshot = await getDocs(sponsorhipsRef);

      for (const doc of querySnapshot.docs) {
        const sponsorhip = doc.data();
        
        if (sponsorhip['sponsorId'] === sponsorId && sponsorhip['tripId'] === tripId) {
          console.log("Checking sponsorhip: ", sponsorhip);
        console.log("Sponsor ID: ", sponsorId);
        console.log("Trip ID: ", tripId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking sponsorhip: ", error);
      return false;
    }
  }
}
