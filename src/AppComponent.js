import React, { useEffect, useState } from 'react';

import ClayAlert from '@clayui/alert';
import ClayCard from '@clayui/card';
import ClayForm from '@clayui/form';
import ClayLayout from '@clayui/layout';
import ClayLink from '@clayui/link';
import {ClaySelect} from '@clayui/form';

import { getLayoutClassName, getLayouts, getLayoutSegmentEntries, getRelativeLayoutURL, getSiteSegmentEntries } from './util/request';

export default function App(props) {
	const [classNameId, setClassNameId] = useState();
	const [layouts, setLayouts] = useState([]);
	const [layoutsIdMap, setLayoutsIdMap] = useState({});
	const [loadingLayouts, setLoadingLayouts] = useState(true);
	const [relativeLayoutURL, setRelativeLayoutURL] = useState();
	const [segmentsExperienceIdGroupIdMap, setSegmentsExperienceIdGroupIdMap] = useState({});
	const [selectedSegmentId, setSelectedSegmentId] = useState();
	const [siteSegmentEntries, setSiteSegmentEntries] = useState([]);

	useEffect(() => {
		getSiteSegmentEntries().then(siteSegmentEntries => {
			const processedSiteSegmentEntries = siteSegmentEntries.map(segmentEntry => (
				{
					label: segmentEntry.nameCurrentValue,
					value: parseInt(segmentEntry.segmentsEntryId),
				}
			));

			if (processedSiteSegmentEntries.length > 0) {
				setSelectedSegmentId(processedSiteSegmentEntries[0].value);
			}

			setSiteSegmentEntries(processedSiteSegmentEntries);
		});

		getLayoutClassName().then(className => {
			setClassNameId(parseInt(className.classNameId));
		});

		setLoadingLayouts(true);

		getLayouts().then(layouts => {
			setLayouts(layouts);

			const layoutsIdMap = {};

			layouts.forEach(layout => {
				layoutsIdMap[parseInt(layout.plid)] = layout;
			});

			setLayoutsIdMap(layoutsIdMap);

			setLoadingLayouts(false);
		});

		getRelativeLayoutURL().then((urls => {
			setRelativeLayoutURL(urls);
		}));
	}, []);

	useEffect(() => {
		if (classNameId && layouts.length > 0) {
			getLayoutSegmentEntries(classNameId, layouts.map(layout => parseInt(layout.plid))).then(segmentEntries => {
				const segmentsExperienceIdGroupIdMap = {};

				const flatSegmentEntries = segmentEntries.flat();

				const segmentEntriesLength = flatSegmentEntries.length;

				for (let i = 0; i < segmentEntriesLength; i++) {
					const segmentEntry = flatSegmentEntries[i];

					const layoutId = parseInt(segmentEntry.classPK);
					const segmentsEntryId = parseInt(segmentEntry.segmentsEntryId);

					if (!segmentsExperienceIdGroupIdMap[segmentsEntryId]) {
						segmentsExperienceIdGroupIdMap[segmentsEntryId] = [layoutId];
					}
					else {
						segmentsExperienceIdGroupIdMap[segmentsEntryId] = [
							...segmentsExperienceIdGroupIdMap[segmentsEntryId],
							layoutId,
						];
					}
				}
				
				setSegmentsExperienceIdGroupIdMap(segmentsExperienceIdGroupIdMap);
			});
		}
	}, [classNameId, layouts.length]);

	return (
		<div>
			<ClayForm.Group>
				<label htmlFor="siteSegmentEntriesSelector">Select a segment to view which pages it is used on.</label>

				<ClaySelect
					aria-label="Select Segment"
					id="siteSegmentEntriesSelector"
					onChange={(event) => setSelectedSegmentId(event.currentTarget.value)}
					value={selectedSegmentId}
				>
					{siteSegmentEntries.map(item => (
						<ClaySelect.Option
							key={item.value}
							label={item.label}
							value={item.value}
						/>
					))}
				</ClaySelect>
			</ClayForm.Group>
			
			{(!loadingLayouts && layouts.length == 0) && 
				<ClayAlert displayType="info" title="Info">
					No pages exist on this site.
				</ClayAlert>
			}

			<ClayLayout.ContainerFluid view>
				{(selectedSegmentId &&
					<>
						{(segmentsExperienceIdGroupIdMap[selectedSegmentId]) ? (
							<ClayLayout.Row justify="start">
								{segmentsExperienceIdGroupIdMap[selectedSegmentId].map(groupId => (
									<ClayLayout.Col key={groupId} size={4}>
										<ClayCard>
											<ClayCard.Body>
												<ClayCard.Description displayType="title">
													{layoutsIdMap[groupId].nameCurrentValue}
												</ClayCard.Description>

												{relativeLayoutURL &&
													<ClayLink
														button
														href={(layoutsIdMap[groupId].privateLayout ? relativeLayoutURL.privateLayout : relativeLayoutURL.publicLayout) + layoutsIdMap[groupId].friendlyURL}
														target="_blank"
													>
														{'Navigate to Page'}
													</ClayLink>
												}
											</ClayCard.Body>
										</ClayCard>
									</ClayLayout.Col>
								))}
							</ClayLayout.Row>
						) : (
							<ClayAlert displayType="info" title="Info">
								The selected segment does not exist on any pages.
							</ClayAlert>
						)}
					</>
				)}
			</ClayLayout.ContainerFluid>
		</div>
	);
}