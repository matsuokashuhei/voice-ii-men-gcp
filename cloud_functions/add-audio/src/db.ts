import {Firestore} from '@google-cloud/firestore';

export const db = new Firestore({projectId: process.env.GCP_PROJECT});
