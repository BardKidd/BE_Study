import { defineAbility } from '@casl/ability';

export default function defineAbilityFor(userPermissions = []) {
  return defineAbility((can) => {
    userPermissions.forEach((permission) => {
      switch (permission.action) {
        case 'edit':
          can('manage', permission.subject);
          break;
        case 'read':
          can('read', permission.subject);
          break;
        default:
          console.log('未知的情況: ', permission.action);
      }
    });
  });
}
