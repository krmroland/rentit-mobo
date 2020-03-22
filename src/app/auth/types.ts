export interface RawUser {
  user: object | null;
  token: string | null;
}

export interface AuthType extends RawUser {
  updateUserData: (data: RawUser) => void;
  persistUserData: (data: RawUser) => Promise<any>;
  accounts: {
    currentId: number | null;
    all: object;
  };
}
