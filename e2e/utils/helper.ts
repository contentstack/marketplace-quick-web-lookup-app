// module dependencies
import { Page } from '@playwright/test';
import { App } from '../pages/App';
import { AppConfig } from '../pages/AppConfig';
import { EntryPage } from '../pages/EntryPage';
import { SidebarWidget } from '../pages/SidebarWidget';
const axios = require('axios');
const jsonfile = require('jsonfile');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

interface ExtensionUid {
  uid: string;
}

const { STACK_API_KEY, ORG_ID, APP_BASE_URL, EMAIL, PASSWORD, DEVELOPER_HUB_API, BASE_API_URL }: any = process.env;

const file = 'data.json';

const savedObj: any = {};

// initialize entry class
export const initializeEntry = async (page: Page) => {
  return new EntryPage(page);
};

// entry page access
export const entryPageFlow = async (savedCredentials: { contentTypeId: any; entryUid: any }, entryPage: EntryPage) => {
  //navigate to stacks page
  const { contentTypeId, entryUid } = savedCredentials;
  await entryPage.navigateToEntry(STACK_API_KEY, contentTypeId, entryUid);
};

const writeFile = async (obj: any) => {
  jsonfile
    .writeFile(file, obj)
    .then((res: any) => {
      return res;
    })
    .catch((error: any) => console.error(error));
};

// Upload an asset to the stack
export const assetUpload = async (stackApiKey: string | undefined, authToken: string) => {
  const assetPath = await path.resolve(__dirname, '../../public/logo192.png');
  const readFile = await fs.createReadStream(assetPath);
  const form = new FormData();
  form.append('asset[upload]', readFile, 'test-asset');
  let options = {
    headers: {
      'Content-Type': 'multipart/form-data',
      api_key: stackApiKey,
      authtoken: authToken,
      ...form.getHeaders(),
    },
    data: form,
  };
  try {
    return await axios.post(`${BASE_API_URL}/v3/assets`, form, options);
  } catch (error) {
    console.error(error);
  }
};

export const deleteAsset = async (authToken: string, assetUid: string) => {
  let options = {
    url: `${BASE_API_URL}/v3/assets/${assetUid}`,
    method: 'DELETE',
    headers: {
      api_key: STACK_API_KEY,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
  };
  try {
    return await axios(options);
  } catch (error) {
    console.error(error);
  }
};

// get authtoken
export const getAuthToken = async () => {
  let options = {
    url: `${BASE_API_URL}/v3/user-session`,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    data: {
      user: {
        email: EMAIL,
        password: PASSWORD,
      },
    },
  };
  try {
    let result = await axios(options);
    savedObj['authToken'] = result.data.user.authtoken;
    await writeFile(savedObj);
    return result.data.user.authtoken;
  } catch (error) {
    console.error(error);
  }
};

interface AppData {
  appId: string;
  appName: string;
}

// create app in developer hub
export const createApp = async (authToken: string, randomTestNumber: number): Promise<AppData | any> => {
  let options = {
    url: `${DEVELOPER_HUB_API}/apps`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
    data: {
      name: `Quick Web Lookup ${randomTestNumber}`,
      target_type: 'stack',
    },
  };
  const result = await axios(options);
  return { appId: result.data.data.uid, appName: options.data.name };
};

// updating app in developer hub & set baseUrl
export const updateApp = async (authToken: string, appId: string, appName: string): Promise<any> => {
  let options = {
    url: `${DEVELOPER_HUB_API}/apps/${appId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
    data: {
      ui_location: {
        signed: false,
        base_url: APP_BASE_URL,
        locations: [
          {
            type: 'cs.cm.stack.sidebar',
            meta: [
              {
                uid: '68a47ec02f0f3821328fc3c8',
                name: appName,
                path: '/entry-sidebar',
                signed: false,
                enabled: true,
                required: false,
              },
            ],
          },
          {
            type: 'cs.cm.stack.config',
            meta: [
              {
                uid: '68a47ecf2f0f3821328fc3ca',
                path: '/app-configuration',
                signed: false,
                enabled: true,
                required: true,
              },
            ],
          },
        ],
      },
      advanced_settings: {
        variables: {},
        mappings: {
          API_KEY: 'peekalink_api_key',
        },
        rewrites: [
          {
            source: '/preview',
            destination: 'https://api.peekalink.io/',
          },
        ],
      },
    },
  };
  return await axios(options);
};

// get installed app
export const getInstalledApp = async (authToken: string, appId: string) => {
  let options = {
    url: `${DEVELOPER_HUB_API}/apps/${appId}/installations`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
  };
  const result = await axios(options);
  return result.data;
};

export const updateServerConfiguration = async (authToken: string, installationId: string, config: any) => {
  let options = {
    url: `${DEVELOPER_HUB_API}/installations/${installationId}/server-configuration`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
    data: config,
  };
  const result = await axios(options);
  return result.data;
};

// install app in stack & return installation id
export const installApp = async (authToken: string, appId: string, stackApiKey: string | undefined) => {
  let options = {
    url: `${DEVELOPER_HUB_API}/apps/${appId}/install`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
    data: {
      target_type: 'stack',
      target_uid: stackApiKey,
    },
  };
  let result = await axios(options);
  return result.data.data.installation_uid;
};

// uninstall app from the stack
export const uninstallApp = async (authToken: string, installId: string) => {
  let options = {
    url: `${DEVELOPER_HUB_API}/installations/${installId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: authToken,
    },
  };
  let result = await axios(options);
  return result.data;
};

// deletes the created test app during tear down
export const deleteApp = async (token: string, appId: string) => {
  let options = {
    url: `${DEVELOPER_HUB_API}/apps/${appId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      organization_uid: ORG_ID,
      authtoken: token,
    },
  };
  await axios(options);
};

// create content-type
export const createContentType = async (authToken: string, appName: string) => {
  // const contentTypeTitle = `${appName} : Content Type`;
  let options = {
    url: `${BASE_API_URL}/v3/content_types`,
    method: 'POST',
    headers: {
      api_key: STACK_API_KEY,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
    data: {
      content_type: {
        title: appName,
        uid: appName.replace(/\s/g, '_').toLowerCase(),
        schema: [
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            field_metadata: {
              _default: true,
            },
            unique: false,
            mandatory: true,
            multiple: false,
          },
          {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            field_metadata: {
              _default: true,
            },
            unique: false,
            multiple: false,
          },
          {
            data_type: 'text',
            display_name: 'Rich Text Editor',
            uid: 'rich_text_editor',
            field_metadata: {
              allow_rich_text: true,
              description: '',
              multiline: false,
              rich_text_type: 'advanced',
              options: [],
              version: 3,
            },
            mandatory: false,
            multiple: false,
            non_localizable: false,
            unique: false,
          },
          {
            data_type: 'json',
            display_name: 'JSON Rich Text Editor',
            uid: 'json_rte',
            field_metadata: {
              allow_json_rte: true,
              embed_entry: false,
              description: '',
              default_value: '',
              multiline: false,
              rich_text_type: 'advanced',
              options: [],
            },
            format: '',
            error_messages: {
              format: '',
            },
            reference_to: ['sys_assets'],
            multiple: false,
            non_localizable: false,
            unique: false,
            mandatory: false,
          },
        ],
      },
    },
  };
  const result = await axios(options);
  return result.data;
};

// create entry
export const createEntry = async (authToken: string, appName: string, contentTypeId: string) => {
  let generateTitle = `${appName} : Entry`;
  let options = {
    url: `${BASE_API_URL}/v3/content_types/${contentTypeId}/entries`,
    params: { locale: 'en-us' },
    method: 'POST',
    headers: {
      api_key: STACK_API_KEY,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
    data: {
      entry: {
        title: generateTitle,
        rich_text_editor:
          '<p>Adding links to the text https://www.google.com </p><p></p><p>https://www.contentstack.com/</p>',
        json_rte: {
          type: 'doc',
          attrs: {},
          uid: '200d3403be2645328860763fa61d7449',
          children: [
            {
              uid: '5f5a7c9fcdb441688cd53909cfa00d78',
              type: 'p',
              attrs: {},
              children: [
                {
                  text: 'Adding links to the text https://www.google.com ',
                },
              ],
            },
            {
              uid: 'edcedb9e56ec4e7ab9049520096f38e0',
              type: 'p',
              attrs: {},
              id: '35d7eb3aaefe4f11896acd3f4acd2ac8',
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              uid: 'bf2fbabce9224be989c4334294d13ef6',
              id: '342f5b9034214d05b74cc8edc1198053',
              type: 'p',
              children: [
                {
                  text: 'https://www.contentstack.com/',
                },
              ],
              attrs: {},
            },
          ],
        },
      },
    },
  };

  const result = await axios(options);
  return result.data;
};

// update entry
export const updateEntry = async (authToken: string, contentTypeId: string, entryUid: string, entry: any) => {
  let options = {
    url: `${BASE_API_URL}/v3/content_types/${contentTypeId}/entries/${entryUid}`,
    params: { locale: 'en-us' },
    method: 'PUT',
    headers: {
      api_key: STACK_API_KEY,
      authtoken: authToken,
      'Content-type': 'application/json',
    },
    data: {
      entry,
    },
  };
  const result = await axios(options);
  return result.data;
};

// deletes the created content type during tear down
export const deleteContentType = async (token: string, contentTypeId: string) => {
  let options = {
    url: `${BASE_API_URL}/v3/content_types/${contentTypeId}`,
    method: 'DELETE',
    headers: {
      api_key: STACK_API_KEY,
      authtoken: token,
      'Content-type': 'application/json',
    },
  };

  await axios(options);
};

// get list of apps/extension IDs
export const getExtensionFieldUid = async (authToken: string) => {
  let options = {
    url: `${BASE_API_URL}/v3/extensions`,
    method: 'GET',
    params: {
      query: {
        type: 'field',
      },
      include_marketplace_extensions: true,
    },
    headers: {
      api_key: STACK_API_KEY,
      authtoken: authToken,
    },
  };

  const result = await axios(options);
  return result.data.extensions[0].uid;
};

export const initializeSidebarWidget = async (page) => {
  return new SidebarWidget(page);
};

export const initializeApp = async (page: Page, appName: string) => {
  return new App(page, appName);
};

export const initializeAppConfig = async (page: Page, installationId: string) => {
  return new AppConfig(page, installationId);
};
