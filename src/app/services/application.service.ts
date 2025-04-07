import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, getDoc,addDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  constructor(private firestore: Firestore) { }

  async createApplication(application: any): Promise<any> {
    try {
      const applicationRef = collection(this.firestore, 'applications');
      const docRef = await addDoc(applicationRef, application);
      return docRef.id;
    } catch (error) {
      console.error("Error creating application: ", error);
      throw error;
    }
  }

  async getAllApplicationsByManagerId(managerId: string): Promise<any[]> {
    try {
      const applicationsRef = collection(this.firestore, 'applications');
      const querySnapshot = await getDocs(applicationsRef);
      let applications: any[] = [];
      querySnapshot.forEach((doc) => {
        let application = doc.data();
        if (application['managerId'] === managerId) {
          applications.push(application);
        }
      });
      return applications;
    } catch (error) {
      console.error("Error fetching applications: ", error);
      return [];
    }
  }

  async hasApplied(explorerId: string, tripId: string): Promise<boolean> {
    try {
      const applicationsRef = collection(this.firestore, 'applications');
      const querySnapshot = await getDocs(applicationsRef);

      for (const doc of querySnapshot.docs) {
        const application = doc.data();
        
        if (application['explorerId'] === explorerId && application['tripId'] === tripId) {
          console.log("Checking application: ", application);
        console.log("Explorer ID: ", explorerId);
        console.log("Trip ID: ", tripId);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking application: ", error);
      return false;
    }
  }
  
}
