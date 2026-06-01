export type IProjectDetails = {
	id: number;
	appUserId: number;
	name: string;
	description: string;
	isArchived: boolean;
	projectParticipants: IProjectParticipants[];
	budget?: IBudget[];
};

export interface IProjectParticipants {
	participant: IParticipant;
}

interface IParticipant {
	appUser: IAppUser | null;
	name: string;
}

interface IAppUser {
	id: number;
}

interface IBudget {
	id: number;
	amount: number;
	limitCriteria: number;
}
