import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from 'src/app/authentication/services/storage.service';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const storageService = inject(StorageService);

  if(!storageService.getAccessToken()) {
    router.navigate(['/login']);
    return false;
  } 

  return true;
};
