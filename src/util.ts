// * All functions and constants below are from PretendoNetwork/account

const ACCOUNT_VALID_CHARACTERS_REGEX = /^[\w\-.]*$/;

// * This sucks
const PASSWORD_WORD_OR_NUMBER_REGEX = /(?=.*[a-zA-Z])(?=.*\d).*/;
const PASSWORD_WORD_OR_PUNCTUATION_REGEX = /(?=.*[a-zA-Z])(?=.*[_\-.]).*/;
const PASSWORD_NUMBER_OR_PUNCTUATION_REGEX = /(?=.*\d)(?=.*[_\-.]).*/;
const PASSWORD_REPEATED_CHARACTER_REGEX = /(.)\1\1/;

// * Ensures the username is not too short or too long
export function checkUsernameLength(username: string): boolean {
    return (username.length >= 1 && username.length <= 32)
}

// * Ensures that the username does not have any invalid character
export function checkUsernameValidCharacters(username: string): boolean {
    return ACCOUNT_VALID_CHARACTERS_REGEX.test(username)
}

// * Checks if the input NNID password passes all validation rules
export function checkPasswordValid(password: string): boolean {
	return checkPasswordLength(password) && checkPasswordAtLeast2CharacterGroups(password) && checkPasswordRepeatCharacters(password);
}

// * Ensures the password is not too short or too long
export function checkPasswordLength(password: string): boolean {
    return (password.length >= 6 && password.length <= 32)
}

// * Ensures the password is at most 16 characters long
export function checkPasswordMaxLength(password: string): boolean {
	return password.length <= 16;
}

// * Ensures the password has a mix of letters, numbers, and/or punctuation characters.
// * Passwords must contain letters from at least 2 of the 3 groups (letters, numbers, and punctuation)
export function checkPasswordAtLeast2CharacterGroups(password: string): boolean {
	return PASSWORD_WORD_OR_NUMBER_REGEX.test(password) || PASSWORD_WORD_OR_PUNCTUATION_REGEX.test(password) || PASSWORD_NUMBER_OR_PUNCTUATION_REGEX.test(password);
}

// * Ensures the password does not have 3 or more repeating characters
export function checkPasswordRepeatCharacters(password: string): boolean {
	return !PASSWORD_REPEATED_CHARACTER_REGEX.test(password);
}


export function getAgeFromDate(dateString: string): number {
	if (!isValidBirthday(dateString)) {
		return -1;
	}

	const parts = dateString.split('-');
	const birthYear = parseInt(parts[0], 10);
	const birthMonth = parseInt(parts[1], 10);
	const birthDay = parseInt(parts[2], 10);

	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth() + 1;
	const currentDay = today.getDate();

	let age = currentYear - birthYear;

	// * Check if birthday has actually happened this year yet
	if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
		age--;
	}

	return age;
}

export function isValidBirthday(dateString: string): boolean {
	// * Birthdays MUST be in the format YYYY-MM-DD. This is how the
	// * console sends them, regardless of region

	// * Make sure general format is right
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(dateString)) {
		return false;
	}

	// * Actually check that it's a valid date
	const parts = dateString.split('-');
	const year = parseInt(parts[0], 10);
	const month = parseInt(parts[1], 10);
	const day = parseInt(parts[2], 10);

	const today = new Date();
	const currentYear = today.getFullYear();
	const currentMonth = today.getMonth() + 1;
	const currentDay = today.getDate();

	// Check that date isn't in the future
	if (currentYear < year && currentMonth < month && currentDay < day) {
		return false;
	}

	if (year < 1900) {
		return false;
	}

	const date = new Date(year, month - 1, day);

	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
