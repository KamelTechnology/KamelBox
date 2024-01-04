package plugin

import (
	. "github.com/KamelTechnology/KamelBox/server/common"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_admin"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_htpasswd"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_ldap"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_openid"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_passthrough"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_authenticate_saml"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_artifactory"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_backblaze"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_dav"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_dropbox"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_ftp"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_gdrive"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_git"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_ldap"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_local"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_mysql"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_nfs"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_nop"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_s3"
	_ "plg_backend_oss"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_samba"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_sftp"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_storj"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_tmp"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_backend_webdav"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_editor_onlyoffice"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_handler_console"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_image_ascii"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_image_c"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_image_transcode"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_search_stateless"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_security_scanner"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_security_svg"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_starter_http"
	_ "github.com/KamelTechnology/KamelBox/server/plugin/plg_video_transcoder"
)

func init() {
	Log.Debug("Plugin loader")
}
