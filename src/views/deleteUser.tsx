import React from 'react';
import { useLocation } from 'react-router-dom';
import { pizzaService } from '../service/service';
import View from './view';
import Button from '../components/button';
import { useBreadcrumb } from '../hooks/appNavigation';

export default function DeleteUser() {
  const state = useLocation().state;
  const navigateToParentPath = useBreadcrumb();

  async function deleteAUser() {
    await pizzaService.deleteUser(state.user.id);
    navigateToParentPath();
  }

  return (
    <View title="Delete this user's account and data?">
      <div className='text-start py-8 px-4 sm:px-6 lg:px-8'>
        <div className='text-neutral-100'>
          Are you sure you want to delete <span className='text-orange-500'>{state.user.name}</span>'s account? This will delete this person's account and associated roles, 
          and cannot be restored. If this person is an admin or a franchisee, any and all franchises they own will be left without an owner, but will otherwise not be affected.
          This action cannot be undone. If you are deleting yourself, we are sad to see you go, and you will be missed.
          Do you wish to proceed?
        </div>
        <Button title='Delete User' onPress={deleteAUser} />
        <Button title='Cancel' onPress={navigateToParentPath} className='bg-transparent border-neutral-300' />
      </div>
    </View>
  );
}