require.config({
  baseUrl: '/test/src',
  shim : {
      'spec_helpers/sinon': {
          exports: 'sinon'
      },
  }
});
