const userPermissions = [
  // 沒有權限就不回傳該筆Object
  {
    page: 'Main',
    subPage: [
      {
        action: 'edit',
        pageNumber: 'A01',
        subject: 'A01',
        path: 'main',
        order: '1',
      },
    ],
  },
  {
    page: 'About',
    subPage: [
      {
        action: 'edit',
        pageNumber: 'B01',
        subject: 'B01',
        path: 'about/b01',
        order: '1',
      },
      {
        action: 'edit',
        pageNumber: 'B02',
        subject: 'B02',
        path: 'about/b02',
        order: '2',
      },
      {
        action: 'edit',
        pageNumber: 'B03',
        subject: 'B03',
        path: 'about/b03',
        order: '3',
      },
    ],
  },
  {
    page: 'Product',
    subPage: [
      {
        action: 'edit',
        pageNumber: 'C01',
        subject: 'C01',
        path: 'product/c01',
        order: '1',
      },
      {
        action: 'edit',
        pageNumber: 'C02',
        subject: 'C02',
        path: 'product/c02',
        order: '2',
      },
      {
        action: 'edit',
        pageNumber: 'C03',
        subject: 'C03',
        path: 'product/c03',
        order: '3',
      },
    ],
  },
];

const result = userPermissions.flatMap((permission) => {
  return permission.subPage.map((item) => item);
});

export default result;
