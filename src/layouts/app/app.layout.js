import React, { Suspense, useState } from 'react';
import { Outlet, useIntl } from '@umijs/max';
import { Helmet } from 'react-helmet';
import ReactInterval from 'react-interval';
import { Form, Layout } from 'antd';
import queryString from 'query-string';

import Page404 from '@/pages/404';
import LandingPage from '@/layouts/landing/page/landing.page.connect';

import Loader from '@/components/Loader';
import Main from '@/components/Main';

import { effectHook } from '@/utils/hooks';
import { t } from '@/utils/i18n';

import './app.layout.module.less';

const { Content } = Layout;

/**
 * @export
 * @param props
 * @return {JSX.Element}
 * @constructor
 */
export const AppLayout = (props) => {
  const intl = useIntl();

  const { mode } = queryString.parse(window.location.search);

  const {
    appModel,
    authModel,
    loading,
    onToggleMenu,
    onUpdate404,
    onUpdateDocumentMeta,
    onRoute,
    onCloseSiderPanel
  } = props;

  const {
    is404,
    language,
    menus,
    collapsedMenu,
    meta,
    layoutOpts: {
      mainMenu,
      mainHeader,
      mainFooter,
      pageBreadcrumbs
    },
    waitBeforeLogin,
    siderPanels
  } = appModel;

  const { user } = authModel;

  const outlet = is404 ? <Page404/> : <Outlet/>;

  const [authLoader, setAuthLoader] = useState(true);

  effectHook(() => {
    setAuthLoader(!user);
  }, [user]);

  const siderProps = {
    onClose: onCloseSiderPanel,
    ...siderPanels[siderPanels?.currentPanel]
  };

  const handleUserAuth = () => {
    // TODO: Find better solution.
    const isAuthenticated = authModel.user || mode === 'signIn';

    setAuthLoader(!isAuthenticated);
  };

  const menuProps = {
    loading,
    authModel,
    defaultDims: {
      min: 80,
      max: 250
    },
    isSider: true
  };

  return (
      <LandingPage spinEffects={[
        'appModel/query',
        'authModel/signIn'
      ]}>
        <div className={'admin'}>
          <Helmet>
            <meta charSet={meta.charSet}/>
            <title>{`${meta.name} ${meta.title}`}</title>
          </Helmet>
          <ReactInterval timeout={waitBeforeLogin}
                         enabled={true}
                         callback={handleUserAuth}/>
          {/*{authLoader ? (*/}
          {/*    <div className={'adminLoading'}>*/}
          {/*      login*/}
          {/*    </div>*/}
          {/*) : (*/}
          <Suspense fallback={<Loader fullScreen spinning={loading.effects['appModel/query']}/>}>
            {/* Have to refresh for production environment */}
            <Layout style={{ minHeight: '100vh' }} key={language}>
              {mainMenu && (
                  <Main.Menu data={menus}
                             spinOn={[
                               'appModel/query',
                               'authModel/signIn',
                             ]}
                             {...menuProps}
                             showLogo={true}
                             onRoute={onRoute}
                             model={appModel}
                             className={'appMenu'}
                             collapsed={collapsedMenu}
                             onCollapse={onToggleMenu}/>
              )}
              <Layout className={'site-layout'}>
                <Layout>
                  <Content>
                    <Form.Provider>
                      {pageBreadcrumbs && mode !== 'signIn' && (
                          <Main.Breadcrumbs meta={meta}
                                            onUpdate404={onUpdate404}
                                            onUpdateDocumentMeta={onUpdateDocumentMeta}/>
                      )}
                      <div className={'site-layout-content'}>
                        {outlet}
                      </div>
                    </Form.Provider>
                  </Content>
                  <Main.Sider {...siderProps}/>
                </Layout>
                {mainFooter && (
                    <Main.Footer>
                      Footer
                    </Main.Footer>
                )}
              </Layout>
            </Layout>
          </Suspense>
          {/*)}*/}
        </div>
      </LandingPage>
  );
};
