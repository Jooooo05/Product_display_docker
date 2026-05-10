<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user');

        // CREATE
        if ($this->isMethod('post')) {
            return [
                'name'      => ['required', 'string', 'max:255'],
                'nickname'  => ['nullable', 'string', 'max:255'],
                'username'  => ['nullable', 'string', 'max:255'], // Optional if nickname is used
                'email'     => ['required', 'email', 'unique:users,email'],
                'password'  => ['required', 'string', 'min:8'],
                'status'    => ['nullable', 'in:active,inactive'],
                'phone'     => ['nullable', 'string', 'max:30'],
                'address'   => ['nullable', 'string'],
                'role'      => ['nullable', 'string', 'exists:roles,name'],
                'permissions'   => ['nullable', 'array'],
                'permissions.*' => ['string', 'exists:permissions,name'],
            ];
        }

        // UPDATE
        return [
            'name'      => ['sometimes', 'string', 'max:255'],
            'nickname'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'username'  => ['sometimes', 'nullable', 'string', 'max:255'],
            'email'     => ['sometimes', 'email', 'unique:users,email,' . $userId],
            'password'  => ['nullable', 'string', 'min:8'],
            'status'    => ['sometimes', 'in:active,inactive'],
            'phone'     => ['sometimes', 'nullable', 'string', 'max:30'],
            'address'   => ['sometimes', 'nullable', 'string'],
            'role'      => ['sometimes', 'nullable', 'string', 'exists:roles,name'],
            'permissions'   => ['sometimes', 'nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique'       => 'Email already taken',
        ];
    }
}
