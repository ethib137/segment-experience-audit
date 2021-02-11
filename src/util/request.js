const groupId = themeDisplay.getSiteGroupId();

export function getSiteSegmentEntries() {
	return new Promise ((resolve, reject) => {
		Liferay.Service(
			'/segments.segmentsentry/get-segments-entries',
			{
				groupId: groupId,
				includeAncestorSegmentsEntries: true
			},
			function(siteSegmentEntries) {
				resolve(siteSegmentEntries);
			}
		);
	});
}

export function getLayoutClassName() {
	return new Promise ((resolve, reject) => {
		Liferay.Service(
			'/classname/fetch-class-name',
			{
				value: 'com.liferay.portal.kernel.model.Layout'
			},
			function(className) {
				resolve(className);
			}
		);
	});
}

export function getLayouts() {
	return new Promise ((resolve, reject) => {
		Liferay.Service(
			[
				{
					'/layout/get-layouts': {
						groupId: groupId,
						privateLayout: false
					}
				},
				{
					'/layout/get-layouts': {
						groupId: groupId,
						privateLayout: true
					}
				}
			],
			function(layouts) {
				resolve(layouts.flat());
			}
		);
	});
}

export function getLayoutSegmentEntries(classNameId, classPKs = []) {
	return new Promise ((resolve, reject) => {
		Liferay.Service(
			classPKs.map(classPK => (
				{
					'/segments.segmentsexperience/get-segments-experiences': {
						groupId,
						classNameId,
						classPK,
						active: true
					}
				}
			)),
			function(layoutSegmentEntries) {
				resolve(layoutSegmentEntries);
			}
		);
	});
}

export function getRelativeLayoutURL() {
	return new Promise ((resolve, reject) => {
		const secureConnection = location.protocol == 'https:';

		Liferay.Service(
			[
				{
					'/group/get-group-display-url': {
						groupId,
						privateLayout: true,
						secureConnection
					}
				},
				{
					'/group/get-group-display-url': {
						groupId,
						privateLayout: false,
						secureConnection
					}
				}
			],
			function(urls) {
				const privateLayoutURL = new URL(urls[0]);
				const publicLayoutURL = new URL(urls[1]);

				resolve({
					privateLayout: privateLayoutURL.pathname,
					publicLayout: publicLayoutURL.pathname,
				});
			}
		);
	});
}
