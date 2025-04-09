import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, getDoc,addDoc, doc, setDoc } from '@angular/fire/firestore';

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
  async getAllApplications(): Promise<any[]> {
    try {
      const applicationsRef = collection(this.firestore, 'applications');
      const querySnapshot = await getDocs(applicationsRef);
      let applications: any[] = [];
      querySnapshot.forEach((doc) => {
        let application = doc.data();
        applications.push(application);
      });
      return applications;
    } catch (error) {
      console.error("Error fetching applications: ", error);
      return [];
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
          application['id'] = doc.id;
          applications.push(application);
        }
      });
      return applications;
    } catch (error) {
      console.error("Error fetching applications: ", error);
      return [];
    }
  }

  async getAllApplicationsByExplorerId(explorerId: string): Promise<any[]> {
    try {
      const applicationsRef = collection(this.firestore, 'applications');
      const querySnapshot = await getDocs(applicationsRef);
      let applications: any[] = [];
      querySnapshot.forEach((doc) => {
        let application = doc.data();
        if (application['explorerId'] === explorerId) {
          application['id'] = doc.id;
          applications.push(application);
        }
      });
      return applications;
    } catch (error) {
      console.error("Error fetching applications: ", error);
      return [];
    }
  }

  async hasApplied(explorerId: (string | undefined), tripId: (string | null)): Promise<boolean> {
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

  async updateApplicationStatus(application: any, status: string): Promise<void> {
    try {
      console.log("Updating application status: ", application);
      console.log("New status: ", status);

      const applicationRef = doc(this.firestore, 'applications', application.id);

      // Construye el objeto de actualización dinámicamente
      const updateData: any = { status: status };
      if (application.rejectReason) {
        updateData.rejectReason = application.rejectReason;
      }

      await setDoc(applicationRef, updateData, { merge: true });
    } catch (error) {
      console.error("Error updating application status: ", error);
      throw error;
    }
  }
  
}
