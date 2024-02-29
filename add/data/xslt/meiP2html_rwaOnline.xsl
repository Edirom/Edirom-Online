<xsl:stylesheet xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:conf="https://www.maxreger.info/conf" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:local="https://www.maxreger.info/local" xmlns:functx="http://www.functx.com" exclude-result-prefixes="xs xd" version="2.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Mar 19, 2012</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> Johannes Kepper</xd:p>
            <xd:p> </xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:output method="xhtml" media-type="text/html" indent="yes" omit-xml-declaration="yes"/>
    <xsl:param name="idPrefix" select="string('')"/>
    <xsl:param name="imagePrefix" select="string('')"/>
    
    <xsl:variable name="configResource" select="doc('xmldb:exist:///db/apps/mriExistDBconf/config.xml')"/>
    <xsl:variable name="config" select="$configResource//conf:elements[@type = 'rwaOnline']"/>
    <xsl:variable name="activeObjectTypes" select="$config//conf:objectType/text()"/>
    <xsl:variable name="activeMRIWorks">
        <xsl:value-of select="doc('xmldb:exist:///db/apps/rwaData/cache/mriWorks-activeWorkDescs.xml')//mei:work/@corresp"/>
    </xsl:variable>
    <xsl:variable name="rwaOnlineURL" select="$configResource//conf:rwaOnlineURL/string()"/>
    <xsl:variable name="docuservURL" select="$configResource//conf:docuservURL/string()"/>
    <xsl:variable name="imagePath" select="concat($docuservURL, 'edition-rwa/images/')"/>
    <xsl:variable name="docuservOptions" select="string('?mo=file')"/>
    
    <xsl:variable name="footnotes">
        <xsl:copy-of select=".//mei:annot[@type = 'note' and @place = 'foot']"/>
    </xsl:variable>
    
    <xsl:variable name="footnotesBlock">
        <xsl:for-each select="$footnotes/mei:annot">
            <xsl:variable name="counter">
                <xsl:value-of select="position()"></xsl:value-of>
            </xsl:variable>
            <xsl:variable name="content">
                <xsl:apply-templates/>
            </xsl:variable>
            <div style="display:flex; color: grey; font-size: smaller; margin-bottom:0.5rem;">
                <div style="display: inline; vertical-align: super; font-size: smaller;">
                    <xsl:value-of select="$counter"></xsl:value-of>
                </div>
                <div style="display: inline; margin-left: .25rem;">
                    <xsl:copy-of select="$content"></xsl:copy-of>
                </div>
            </div>
        </xsl:for-each>
    </xsl:variable>
    
    <xsl:function name="functx:index-of-deep-equal-node" as="xs:integer*">
        <xsl:param name="nodes" as="node()*"/>
        <xsl:param name="nodeToFind" as="node()"/>
        <xsl:sequence select="
            for $seq in (1 to count($nodes))
            return $seq[deep-equal($nodes[$seq],$nodeToFind)]
            "/>
    </xsl:function>
    
    <xsl:function name="local:getObjectType">
        <xsl:param name="objectID"></xsl:param>
        <xsl:choose>
            <xsl:when test="matches($objectID, 'mri_work_*')">mriWork</xsl:when>
            <xsl:when test="matches($objectID, 'mri_postObj_*')">mriPostalItem</xsl:when>
            <xsl:when test="matches($objectID, 'mri_doc_*')">mriDocument</xsl:when>
            <xsl:when test="matches($objectID, 'mri_pers_*')">mriPersonalia</xsl:when>
            <xsl:when test="matches($objectID, 'mri_inst_*')">mriPersonalia</xsl:when>
            <xsl:when test="matches($objectID, 'mri_template_*')">mriTemplate</xsl:when>
            <xsl:when test="matches($objectID, 'mri_loc_*')">mriLocation</xsl:when>
            <xsl:when test="matches($objectID, 'rwa_blogpost_*')">rwaBlogpost</xsl:when>
            <xsl:when test="matches($objectID, 'bio_*')">mrpBio</xsl:when>
            <xsl:when test="matches($objectID, 'rwa_annotation_*')">rwaAnnot</xsl:when>
            <xsl:otherwise>undefined</xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <xsl:template match="/">
        <xsl:apply-templates/>
        <xsl:if test="$footnotes != ''">
            <hr/>
            <xsl:copy-of select="$footnotesBlock"/>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="mei:p">
        <p>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
            </xsl:if>
            <xsl:apply-templates select="* | text()"/>
        </p>
    </xsl:template>
    
    <xsl:template match="mei:annot[@type = 'note' and @place = 'foot']">
        <xsl:variable name="footnoteCount">
            <xsl:value-of select="functx:index-of-deep-equal-node($footnotes/mei:annot, .)"></xsl:value-of>
        </xsl:variable>
        <span class="sup"><xsl:value-of select="$footnoteCount"/></span>
    </xsl:template>
    
    <xsl:template match="mei:ref">
        <xsl:variable name="objectID" select="replace(replace(./@target/string(), '.html', ''), '#', '')"/>
        <xsl:variable name="objectType" select="local:getObjectType($objectID)"/>
        <xsl:choose>
            <xsl:when test="$objectType = $activeObjectTypes">
                <span>
                    <xsl:attribute name="class">ref</xsl:attribute>
                    <xsl:choose>
                        <xsl:when test="$objectType = 'rwaAnnot'">
                            <xsl:variable name="rwaWorkDocURI" select="doc(concat($rwaOnlineURL, 'rest/getDocURI.xql?id=', $objectID))//uri/string()"/>
                            <xsl:variable name="rwaAnnotURI" select="concat('xmldb:exist://', $rwaWorkDocURI, '#', $objectID)"/>
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="$rwaAnnotURI"/>
                                <xsl:text>', {})</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="$objectType = $activeObjectTypes">
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="$rwaOnlineURL"/>
                                <xsl:value-of select="$objectID"/>
                                <xsl:text>.html', {})</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="matches(@target, '\[.*\]')">
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="replace(@target, '\[.*\]', '')"/>
                                <xsl:text>', {</xsl:text>
                                <xsl:value-of select="replace(substring-before(substring-after(@target, '['), ']'), '=', ':')"/>
                                <xsl:text>})</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink("</xsl:text>
                                <xsl:value-of select="@target"/>
                                <xsl:text>")</xsl:text>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="@xml:id">
                        <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
                    </xsl:if>
                    <xsl:apply-templates select="* | text()"/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="text()"></xsl:value-of>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="mei:rend">
        <xsl:variable name="style">
            <xsl:if test="@color">
                color: 
                <xsl:choose>
                    <xsl:when test="starts-with(@color, 'x')">
                        #<xsl:value-of select="substring(@color, 2)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="@color"/>
                    </xsl:otherwise>
                </xsl:choose>;
                
            </xsl:if>
            <xsl:if test="@fontfam | @fontname">
                font-family: <xsl:value-of select="string-join(@fontfam | @fontname,', ')"/>;
            </xsl:if>
            <xsl:if test="@fontweight">
                font-weight: <xsl:value-of select="@fontweight"/>;
            </xsl:if>
            <xsl:if test="not(@fontweight) and @rend='bold'">
                font-weight: <xsl:value-of select="'bold'"/>;
            </xsl:if>
            <xsl:if test="@fontstyle">
                font-style: <xsl:value-of select="if(@fontstyle eq 'ital') then('italic') else(@fontstyle)"/>;
            </xsl:if>
        </xsl:variable>
        <span>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
            </xsl:if>
            <xsl:if test="@rend and string-length(@rend) gt 0">
                <xsl:attribute name="class" select="@rend"/>
            </xsl:if>
            <xsl:if test="string-length($style) gt 0">
                <xsl:attribute name="style" select="normalize-space($style)"/>
            </xsl:if>
            <xsl:apply-templates select="* | text()"/>
        </span>
    </xsl:template>
    <xsl:template match="mei:lb">
        <br>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
            </xsl:if>
        </br>
    </xsl:template>
    <xsl:template match="mei:quote">
        <span class="quote">
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
            </xsl:if>
            <xsl:apply-templates select="* | text()"/>
        </span>
    </xsl:template>
    <xsl:template match="mei:fig[./mei:graphic]">
        <!-- TODO: abfangen, wenn sowohl fig als auch graphic eine ID haben… -->
        <figure class="figure">
            <img class="graphic">
                <xsl:if test="@xml:id">
                    <xsl:attribute name="xml:id" select="concat($idPrefix,@xml:id)"/>
                </xsl:if>
                <xsl:if test="not(@xml:id) and ./mei:graphic/@xml:id">
                    <xsl:attribute name="xml:id" select="concat($idPrefix,./mei:graphic/@xml:id)"/>
                </xsl:if>
                <xsl:if test="./mei:caption">
                    <xsl:attribute name="title" select="./mei:caption//text()"/>
                    <xsl:attribute name="alt" select="./mei:caption//text()"/>
                </xsl:if>
                <xsl:attribute name="src" select="concat($imagePath, ./mei:graphic/@target/string(), $docuservOptions)"/>
            </img>
            <xsl:if test="./mei:figDesc">
                <figcaption>
                    <xsl:apply-templates/>
                </figcaption>
            </xsl:if>
        </figure>
    </xsl:template>
    <xsl:template match="text()">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>