import { User, Profile, UserProfile } from "./user";

export default class UserUtils {

    static mapToUserProfile(user: User, profile: Profile): UserProfile {

        let userProfile = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            roles: user.roles,
            profile: profile
        }

        return userProfile;
    }

}