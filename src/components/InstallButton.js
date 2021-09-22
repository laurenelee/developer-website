import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import { Button, Link, Icon } from '@newrelic/gatsby-theme-newrelic';
import {
  getPackNr1Url,
  getGuidedInstallStackedNr1Url,
} from '../utils/get-pack-nr1-url';
import {
  NR1_LOGIN_URL,
  NR1_GUIDED_INSTALL_NERDLET,
  NR1_PACK_DETAILS_NERDLET,
  UTM_PARAMETERS,
} from '../data/constants';
import { quickstart } from '../types';

/**
 * @param {Object} location
 * @returns {String}
 */
const parseUtmParameters = (location) => {
  const parameters = location.state.prevPath.search;

  const parametersArray =
    parameters[0] === '?'
      ? parameters.slice(1).split('&')
      : parameters.split('&');

  const utmParametersArray = parametersArray.filter((param) => {
    const [key] = param.split('=');
    return UTM_PARAMETERS.includes(key);
  });

  return utmParametersArray.join('&');
};

/**
 * @param {String} id
 * @param {String} nerdletId
 * @param {String} utmParameters
 * @returns {String}
 */
const createInstallLink = (id, nerdletId, hasGuidedInstall, utmParameters) => {
  const platformUrl = hasGuidedInstall
    ? getGuidedInstallStackedNr1Url(nerdletId)
    : getPackNr1Url(id, nerdletId);

  const url = new URL(
    `?return_to=${encodeURIComponent(platformUrl)}&${utmParameters}`,
    NR1_LOGIN_URL
  );

  return url.href;
};

/**
 * @param {quickstart} quickstart
 * @param {String} key
 * @returns {Boolean}
 */
const hasComponent = (quickstart, key) =>
  quickstart[key] && quickstart[key].length > 0;

const InstallButton = ({ quickstart, location, ...props }) => {
  const hasInstallableComponent = hasComponent(quickstart, 'installPlans');

  const hasGuidedInstall =
    hasInstallableComponent &&
    quickstart.installPlans.length === 1 &&
    quickstart.installPlans[0].id.includes('guided-install');

  // If there is nothing to install AND no documentation, don't show this button.
  if (!hasInstallableComponent && !hasComponent(quickstart, 'documentation')) {
    return null;
  }

  const nerdletId = hasGuidedInstall
    ? NR1_GUIDED_INSTALL_NERDLET
    : NR1_PACK_DETAILS_NERDLET;

  const utmParameters = parseUtmParameters(location);
  // If we have an install-able component, generate a URL. Otherwise, link to the
  // first documentation supplied.
  const url = hasInstallableComponent
    ? createInstallLink(
        quickstart.id,
        nerdletId,
        hasGuidedInstall,
        utmParameters
      )
    : quickstart.documentation[0].url;

  return (
    <Button {...props} as={Link} to={url} variant={Button.VARIANT.PRIMARY}>
      {hasInstallableComponent ? (
        <>
          <Icon
            name="fe-plus"
            viewBox="0 0 16 16"
            css={css`
              margin-right: 7px;
            `}
          />
          Install quickstart
        </>
      ) : (
        'See installation docs'
      )}
    </Button>
  );
};

InstallButton.propTypes = {
  quickstart: quickstart.isRequired,
  onClick: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default InstallButton;
