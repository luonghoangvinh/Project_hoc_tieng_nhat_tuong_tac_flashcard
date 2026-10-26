import { ExerciseProgress } from "../types";
import { getAuthHeaders } from './apiHeaders';

const API_URL = import.meta.env.VITE_API_URL;
export default async function createNewExProgress(exerciseProgress: ExerciseProgress) {
    try {
        const response = await fetch(`${API_URL}/exercise-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(exerciseProgress)
        });

        if (!response.ok) {
            throw new Error('Failed to create exercise progress');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating exercise progress:', error);
        throw error;
    }
}

export async function updateExProgress(exerciseProgressId: string, exerciseProgress: ExerciseProgress) {
    try {
        const response = await fetch(`${API_URL}/exercise-progress/${exerciseProgressId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(exerciseProgress)
        });

        if (!response.ok) {
            throw new Error('Failed to update exercise progress');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating exercise progress:', error);
        throw error;
    }
}
