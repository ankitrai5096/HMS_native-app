const initialState = {
  user: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER": {
      const userData = action.payload || {};
      return {
        ...state,
        user: {
          displayName: userData.displayName || "Unknown",
          email: userData.email || "Unknown",
          emailVerified: userData.emailVerified || "Unknown",
          phoneNumber: userData.phoneNumber || "Unknown",
          photoURL: userData.photoURL || "Unknown",
          providerId: userData.providerId || "Unknown",
          uid: userData.uid || "Unknown",
          metadata: {
            creationTime: userData.metadata?.creationTime ?? null,
            lastSignInTime: userData.metadata?.lastSignInTime ?? null,
          },
        },
      };
    }
    case "CLEAR_USER":
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export default authReducer;
