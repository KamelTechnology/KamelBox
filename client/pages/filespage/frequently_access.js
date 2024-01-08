import React from "react";
import { Link } from "react-router-dom";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import { Container, Icon, NgIf } from "../../components/";
import { URL_TAGS, URL_FILES } from "../../helpers/";
import Path from "path";
import { t } from "../../locales/";

import "./frequently_access.scss";

export function FrequentlyAccess({ files, tags }) {
    let showPlaceholder = true;
    if (files === null || tags === null) showPlaceholder = false;
    else if (files && files.length > 0) showPlaceholder = false;
    else if(tags && tags.length > 0) showPlaceholder = false;

    return (
        <div className="component_frequently-access no-select">
            <ReactCSSTransitionGroup
                transitionName="frequent-access" transitionLeave={false} transitionEnter={true}
                transitionAppear={true} transitionEnterTimeout={500}
                transitionAppearTimeout={300}>
                <Container key={files === null ? "nothing" : "something"}>
                    <NgIf cond={!!files && files.length > 0}>
                        <span className="caption">{t("Quick Access")}</span>
                        <div className="frequent_wrapper">
                            {
                                files && files.map((path, index) => {
                                    return (
                                        <Link
                                            key={path}
                                            to={URL_FILES+path+window.location.search}>
                                            <Icon name={"directory"} />
                                            <div>{Path.basename(path)}</div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    </NgIf>
                    <NgIf cond={!!tags && tags.length > 0}>
                        <span className="caption">{t("Tag")}</span>
                        <div className="frequent_wrapper">
                            <Link to={"/tags/"}>
                                <Icon name={"directory"} />
                                <div>All</div>
                            </Link>
                            {
                                tags && tags.map((tag, index) => {
                                    return (
                                        <Link
                                            key={tag}
                                            to={"/tags/" + tag + "/"}>
                                            <Icon name={"directory"} />
                                            <div>{tag}</div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    </NgIf>
                    <NgIf
                        cond={showPlaceholder}
                        className="nothing_placeholder">
                        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M390.187 485.333H121.814C49.2802 485.333 45.4402 445.44 42.2402 413.227L33.7069 306.346C31.7869 285.653 37.7602 264.96 50.9869 248.32C66.7736 229.12 89.1736 218.667 113.28 218.667H398.72C422.4 218.667 444.8 229.12 459.947 247.253L463.574 252.16C475.094 267.946 480.214 287.146 478.294 306.56L469.76 413.013C466.56 445.44 462.72 485.333 390.187 485.333ZM113.28 250.667C98.9869 250.667 85.3336 257.066 76.3736 268.16L74.8802 269.653C68.0536 278.4 64.4269 290.773 65.7069 303.573L74.2402 410.453C77.2269 441.6 78.5069 453.333 121.814 453.333H390.187C433.707 453.333 434.774 441.6 437.76 410.24L446.294 303.36C447.574 290.773 443.947 278.186 435.627 268.373L433.494 265.813C423.894 255.787 411.734 250.667 398.507 250.667H113.28Z" fill="#d6e5ff"/>
                            <path d="M437.334 260.693C428.587 260.693 421.334 253.44 421.334 244.693V206.507C421.334 142.933 410.24 131.84 346.667 131.84H292.267C268.16 131.84 259.84 123.307 250.667 111.147L223.147 74.6666C213.76 62.2933 211.627 59.3066 192.427 59.3066H165.334C101.76 59.3066 90.667 70.4 90.667 133.973V243.84C90.667 252.587 83.4137 259.84 74.667 259.84C65.9203 259.84 58.667 252.587 58.667 243.84V133.973C58.667 52.2666 83.627 27.3066 165.334 27.3066H192.64C225.494 27.3066 235.734 37.9733 248.96 55.4666L276.267 91.7333C282.027 99.4133 282.454 99.84 292.48 99.84H346.88C428.587 99.84 453.547 124.8 453.547 206.507V244.693C453.334 253.44 446.08 260.693 437.334 260.693Z" fill="#d6e5ff"/>
                            <path d="M310.827 378.667H201.174C192.427 378.667 185.174 371.413 185.174 362.667C185.174 353.92 192.427 346.667 201.174 346.667H310.827C319.574 346.667 326.827 353.92 326.827 362.667C326.827 371.413 319.787 378.667 310.827 378.667Z" fill="#d6e5ff"/>
                        </svg>
                        { t("سيتم عرض المجلدات التي يتم الوصول إليها بشكل متكرر هنا") }
                    </NgIf>
                </Container>
            </ReactCSSTransitionGroup>
        </div>
    );
}
