import * as yup from 'yup'

export const signInValidationSchema = yup.object().shape({
	username: yup.string()
		// .email('Email is invalid')
		.required('Username is required'),
	password: yup.string()
		.min(8, 'Password has to be longer than 8 characters!')
		.required('Password is required!')
});

export const passwordValidationSchema = yup
	.string()
	.min(8, 'Password must be 8 characters or longer')
	.matches(/^(?=.*([A-Z]){1,})(?=.*[!@#$%^\-&*()_+=]{1,})(?=.*[0-9]{1,})(?=.*[a-z]{1,}).{8,50}$/g, 'Password not complex enough.')
	.required('Password is required')

export const passwordConfirmationValidationSchema = yup.string().oneOf([yup.ref('password'), null], 'Passwords must match')
