<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:exist="http://exist.sourceforge.net/NS/exist" xmlns:functx="http://www.functx.com"
    exclude-result-prefixes="#default xs tei xhtml" version="2.0">
    <xsl:include href="functx-1.0-nodoc-2007-01.xsl"/>
    <xsl:import href="tei/common2/tei-param.xsl"/>
    <xsl:import href="tei/common2/tei.xsl"/>
    <xsl:import href="tei/xhtml2/tei-param.xsl"/>
    <xsl:import href="tei/common2/core.xsl"/>
    <xsl:import href="tei/common2/textstructure.xsl"/>
    <xsl:import href="tei/common2/header.xsl"/>
    <xsl:import href="tei/common2/linking.xsl"/>
    <xsl:import href="tei/common2/figures.xsl"/>
    <xsl:import href="tei/common2/textcrit.xsl"/>
    <xsl:import href="tei/common2/i18n.xsl"/>
    <xsl:import href="tei/common2/functions.xsl"/>
    <xsl:import href="tei/xhtml2/core.xsl"/>
    <xsl:import href="tei/xhtml2/corpus.xsl"/>
    <xsl:import href="tei/xhtml2/dictionaries.xsl"/>
    <xsl:import href="tei/xhtml2/drama.xsl"/>
    <xsl:import href="tei/xhtml2/figures.xsl"/>
    <xsl:import href="tei/xhtml2/header.xsl"/>
    <xsl:import href="tei/xhtml2/linking.xsl"/>
    <xsl:import href="tei/xhtml2/namesdates.xsl"/>
    <xsl:import href="tei/xhtml2/tagdocs.xsl"/>
    <xsl:import href="tei/xhtml2/textstructure.xsl"/>
    <xsl:import href="tei/xhtml2/textcrit.xsl"/>
    <xsl:import href="tei/xhtml2/transcr.xsl"/>
    <xsl:import href="tei/xhtml2/verse.xsl"/>
    <xsl:import href="tei/common2/verbatim.xsl"/>
    <xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes" xml:space="preserve"/>
    <xsl:param name="lang">en</xsl:param>
    <xsl:param name="base" as="xs:string"/>
    <xsl:param name="docUri" as="xs:anyURI"/>
    <xsl:param name="contextPath" as="xs:string"/>
    <!-- OVERWRITE FOLLOWING TEI-PARAMS -->
    <!-- END OVERWRITE TEI-PARAMS -->
    <!-- FREIDI PARAMETER -->
    <xsl:param name="textType"/>
    <!-- END FREIDI PARAMETER -->
    <xsl:variable name="masterFile" select="string('file')"/>
    <xsl:variable name="i18n" select="document(concat($base, 'tei/i18n.xml'))"/>
    <xsl:variable name="language">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, 'i18n/{$lang}.xml'))">
                <xsl:copy-of select="document(concat($base, 'i18n/{$lang}.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fallback">
        <xsl:choose>
            <xsl:when test="$lang eq 'en'"/>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:function name="tei:getLabel" xpath-default-namespace="">
        <xsl:param name="key"/>
        <xsl:choose>
            <!--<xsl:when test="$lang eq 'en'">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>-->
            <xsl:when test="$language/id($key) and not($language/id($key)/text() eq '')">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <!--<xsl:value-of select="$fallback/id($key)/text()"/><!-\- BWB welchen Sinn macht das? -\->-->
                <xsl:value-of select="$key"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    <xsl:function name="tei:calcDimension">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="contains($value,'in')">
                <xsl:value-of select="round($dpi * number(substring-before($value,'in')))"/>
            </xsl:when>
            <xsl:when test="contains($value,'pt')">
                <xsl:value-of select="round($dpi * (number(substring-before($value,'pt')) div 72))"/>
            </xsl:when>
            <xsl:when test="contains($value,'cm')">
                <xsl:value-of select="round($dpi * (number(substring-before($value,'cm')) div 2.54 ))"/>
            </xsl:when>
            <xsl:when test="contains($value,'px')">
                <xsl:value-of select="substring-before($value,'px')"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$value"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    <xsl:template name="makeSection">
        <xsl:param name="element"/>
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('section')"/>
            <xsl:element name="h1">
                <xsl:value-of select="if(tei:getLabel(local-name($element)) != '')then(tei:getLabel(local-name($element)))else(local-name($element))"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('propertyList')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template name="bodyMicroData"/>
    <xsl:template name="divContents">
        <xsl:param name="Depth"/>
        <xsl:param name="nav">false</xsl:param>
        <xsl:variable name="ident">
            <xsl:apply-templates mode="ident" select="."/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="parent::tei:*/@rend='multicol'">
                <td valign="top">
                    <xsl:if test="not($Depth = '')">
                        <xsl:element name="h{$Depth + $divOffset}">
                            <xsl:for-each select="tei:head[1]">
                                <xsl:call-template name="rendToClass">
                                    <xsl:with-param name="default"/>
                                </xsl:call-template>
                            </xsl:for-each>
                            <xsl:call-template name="header">
                                <xsl:with-param name="display">full</xsl:with-param>
                            </xsl:call-template>
                            <xsl:call-template name="sectionHeadHook"/>
                        </xsl:element>
                    </xsl:if>
                    <xsl:apply-templates/>
                </td>
            </xsl:when>
            <xsl:when test="@rend='multicol'">
                <xsl:apply-templates select="*[not(local-name(.)='div')]"/>
                <table>
                    <tr>
                        <xsl:apply-templates select="tei:div"/>
                    </tr>
                </table>
            </xsl:when>
            <xsl:when test="@rend='nohead' or not(tei:head)">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test="not($Depth = '')">
                    <xsl:element name="{if (number($Depth)+$divOffset &gt;6) then 'div'                     else concat('h',number($Depth) + $divOffset)}">
                        <xsl:choose>
                            <xsl:when test="@rend">
                                <xsl:call-template name="rendToClass">
                                    <xsl:with-param name="id">false</xsl:with-param>
                                </xsl:call-template>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:for-each select="tei:head">
                                    <xsl:call-template name="rendToClass">
                                        <xsl:with-param name="default">
                                            <xsl:if test="number($Depth)&gt;5">
                                                <xsl:text>div</xsl:text>
                                                <xsl:value-of select="$Depth"/>
                                            </xsl:if>
                                        </xsl:with-param>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:otherwise>
                        </xsl:choose>
                        <xsl:call-template name="header">
                            <xsl:with-param name="display">full</xsl:with-param>
                        </xsl:call-template>
                        <xsl:call-template name="sectionHeadHook"/>
                    </xsl:element>
                    <xsl:if test="$topNavigationPanel='true' and $nav='true'">
                        <xsl:call-template name="xrefpanel">
                            <xsl:with-param name="homepage" select="concat($masterFile,$standardSuffix)"/>
                            <xsl:with-param name="mode" select="local-name(.)"/>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:if>
                <xsl:apply-templates/>
                <xsl:if test="$bottomNavigationPanel='true' and $nav='true'">
                    <xsl:call-template name="xrefpanel">
                        <xsl:with-param name="homepage" select="concat($masterFile,$standardSuffix)"/>
                        <xsl:with-param name="mode" select="local-name(.)"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="showGraphic">
        <xsl:variable name="File">
            <xsl:choose>
                <xsl:when test="starts-with(@url, 'http://')">
                    <xsl:value-of select="@url"/>
                </xsl:when>
                <xsl:when test="starts-with(@url, '/exist/')">
                    <xsl:value-of select="@url"/>
                </xsl:when>
                <xsl:when test="starts-with(@url, '../')">
                    <xsl:variable name="folder-ups" select="functx:number-of-matches(@url, '../')"/>
                    <xsl:variable name="unprefixedDocUri" select="substring-after($docUri, 'xmldb:exist:///db/')"/>
                    <xsl:variable name="uri-tokens" select="tokenize($unprefixedDocUri, '/')" as="xs:string*"/> 
<!--                    <xsl:value-of select="string-join(($uri-tokens[position() lt last() - $folder-ups]), '/') || functx:substring-after-last-match(@url, '../')"/>-->
                    <xsl:value-of select="string-join(($contextPath, $uri-tokens[position() lt last() - $folder-ups + 1], functx:substring-after-last-match(@url, '\.\./')), '/')"/>
                </xsl:when>
                <xsl:when test="@url != ''">
                    <xsl:value-of select="@url"/>
                    <!--<xsl:value-of select="concat($graphicsPrefix, @url)"/>
                    <xsl:if test="not(contains(@url,'.'))">
                        <xsl:value-of select="$graphicsSuffix"/>
                    </xsl:if>
                    <xsl:text>?</xsl:text>
                    <xsl:for-each-group group-by="parent::node()" select="@width | @height | @scale"><!-\- | @scale -\->
                        <xsl:for-each select="current-group()">
                            <xsl:choose>
                                <xsl:when test="name() = 'height'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
                                <xsl:when test="name() = 'width'">
                                    <xsl:value-of select="concat('dw=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
<!-\-                            <xsl:when test="name() = 'scale'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&', 'amp;')"/>
                                </xsl:when>-\->
                                <xsl:otherwise/>
                            </xsl:choose>
                        </xsl:for-each>
                    </xsl:for-each-group>
                    <xsl:if test="not(@width | @height | @scale)">
                        <xsl:value-of select="concat('dw=350', '&amp;', 'amp;')"/>
                    </xsl:if>
                    <xsl:text>mo=fit</xsl:text>-->
                </xsl:when>
                <xsl:when test="@url = ''">error<xsl:value-of select="$graphicsSuffix"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message terminate="yes">Cannot work out how to do a graphic
                    </xsl:message>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="Alt">
            <xsl:choose>
                <xsl:when test="tei:desc">
                    <xsl:for-each select="tei:desc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:figDesc">
                    <xsl:for-each select="tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:head">
                    <xsl:value-of select="tei:head/text()"/>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:figDesc">
                    <xsl:for-each select="parent::tei:figure/tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:head">
                    <xsl:value-of select="parent::tei:figure/tei:head/text()"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$showFigures='true'">
                <xsl:choose>
                    <xsl:when test="@type='thumbnail'"/>
                    <xsl:when test="starts-with(@mimeType, 'video')">
                        <video src="{$File}" controls="controls">
                            <xsl:if test="../tei:graphic[@type='thumbnail']">
                                <xsl:attribute name="poster">
                                    <xsl:value-of select="../tei:graphic[@type='thumbnail']/@url"/>
                                </xsl:attribute>
                            </xsl:if>
                        </video>
                    </xsl:when>
                    <xsl:otherwise>
                        <img src="{$File}">
                            <xsl:attribute name="alt">
                                <xsl:value-of select="$Alt"/>
                            </xsl:attribute>
                            <xsl:call-template name="imgHook"/>
                            <xsl:if test="@xml:id">
                                <xsl:attribute name="id">
                                    <xsl:value-of select="@xml:id"/>
                                </xsl:attribute>
                            </xsl:if>
                            <xsl:call-template name="rendToClass"/>
                            <xsl:if test="@width">
                                <xsl:call-template name="setDimension">
                                    <xsl:with-param name="value">
                                        <xsl:value-of select="@width"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="name">width</xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                            <xsl:if test="@height">
                                <xsl:call-template name="setDimension">
                                    <xsl:with-param name="value">
                                        <xsl:value-of select="@height"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="name">height</xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                        </img>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <div class="altfigure">
                    <xsl:call-template name="i18n">
                        <xsl:with-param name="word">figureWord</xsl:with-param>
                    </xsl:call-template>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="self::tei:figure|parent::tei:figure">
                        <xsl:number count="tei:figure[tei:head]" level="any"/>
                    </xsl:for-each>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="$File"/>
                    <xsl:text> [</xsl:text>
                    <xsl:value-of select="$Alt"/>
                    <xsl:text>] </xsl:text>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:ref">
        <xsl:param name="class">link_<xsl:value-of select="local-name(.)"/>
        </xsl:param>
        <xsl:choose>
            <xsl:when test="starts-with(@target, 'xmldb:exist://')">
                <a>
                    <xsl:choose>
                        <xsl:when test="matches(@target, '\[.*\]')">
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="replace(@target, '\[.*\]', '')"/>
                                <xsl:text>', {</xsl:text>
                                <xsl:value-of select="replace(substring-before(substring-after(@target, '['), ']'), '=', ':')"/>
                                <xsl:text>}); return false;</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink("</xsl:text>
                                <xsl:value-of select="@target"/>
                                <xsl:text>"); return false;</xsl:text>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:attribute name="href" select="@target"/>
                    <xsl:if test="@xml:id">
                        <xsl:copy-of select="@xml:id"/>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@rend">
                            <xsl:attribute name="class">
                                <xsl:value-of select="@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="@rendition">
                            <xsl:call-template name="applyRendition"/>
                        </xsl:when>
                        <xsl:when test="parent::tei:item/parent::tei:list[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/parent::tei:list/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="parent::tei:item[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="class">
                                <xsl:value-of select="$class"/>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="@type">
                        <xsl:attribute name="type">
                            <xsl:value-of select="@type"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@n">
                            <xsl:attribute name="title">
                                <xsl:value-of select="@n"/>
                            </xsl:attribute>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:call-template name="xrefHook"/>
                    <xsl:apply-templates/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="id" select="@xml:id"/>
                <xsl:variable name="targetExternal" select="@type"/>
                <xsl:variable name="targetInternal" select="starts-with(@target, '#')" as="xs:boolean"/>
                <xsl:variable name="link">
                    <xsl:call-template name="makeTEILink">
                        <xsl:with-param name="ptr" select="false()"/>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:for-each select="$link/*">
                    <xsl:copy>
                        <xsl:if test="$id">
                            <xsl:attribute name="id" select="$id"/>
                        </xsl:if>
                        <xsl:if test="$targetExternal eq 'external'">
                            <xsl:attribute name="target" select="'_blank'"/>
                        </xsl:if>
                        <xsl:if test="$targetInternal">
                            <xsl:attribute name="target" select="'_self'"/>
                        </xsl:if>
                        <xsl:for-each select="*|text()|@*">
                            <xsl:copy-of select="."/>
                        </xsl:for-each>
                    <xsl:if test="count(text()) = 0">
                            <xsl:variable name="href" select="@href"/>
                            <xsl:element name="span">
                                <xsl:attribute name="class">external-link</xsl:attribute>
                                [Link: <xsl:value-of select="$href"/>]
                            </xsl:element></xsl:if>
                    </xsl:copy>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:abbr">
        <xsl:element name="span">
            <xsl:attribute name="class">abbr</xsl:attribute>
            <xsl:attribute name="title">
                <xsl:value-of select="."/>
            </xsl:attribute>
            <xsl:apply-templates select="text()"/>
        </xsl:element>
    </xsl:template>
<xsl:template match="exist:match">
        <span class="searchResult">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
<xsl:template match="tei:pb" priority="5">
        <xsl:variable name="page_folio">
            <xsl:choose>
                <xsl:when test="matches(@n, '\d+[a-z]?(r|v)')"> fol. </xsl:when>
                <xsl:when test="@n"> pag. </xsl:when>
            <xsl:otherwise/>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$filePerPage='true'">
                <PAGEBREAK>
                    <xsl:attribute name="name">
                        <xsl:apply-templates select="." mode="ident"/>
                    </xsl:attribute>
                    <xsl:copy-of select="@facs"/>
                </PAGEBREAK>
            </xsl:when>
            <xsl:when test="@facs and not(@rend='none') and not(@rend='-')">
                <xsl:variable name="IMG">
                    <xsl:choose>
                        <xsl:when test="starts-with(@facs,'#')">
                            <xsl:for-each select="id(substring(@facs,2))">
                                <xsl:value-of select="tei:graphic[1]/@url"/>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="@facs"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:element name="{if (tei:is-inline(..)) then 'span' else 'div'}">
                    <xsl:call-template name="rendToClass"/>
                    <img src="{$IMG}" alt="page image"/>
                </xsl:element>
            </xsl:when>
            <xsl:when test="$pagebreakStyle='active'">
                <div class="pagebreak">
                    <xsl:call-template name="rendToClass"/>
                </div>
            </xsl:when>
            <xsl:when
                test="$pagebreakStyle='visible' and (parent::tei:body         or parent::tei:front or parent::tei:back or parent::tei:group)">
                <xsl:if test="@rend='-'">
                    <span class="hyphen">
                        <xsl:text>-</xsl:text>
                    </span>
                </xsl:if>
                <div class="pagebreak">
                    <xsl:call-template name="makeAnchor"/>
                    <xsl:value-of select="concat(' ', $page_folio, ' ')"/>
                    <xsl:if test="@n">
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="@n"/>
                    </xsl:if>
                </div>
            <br class="pb"/>
            </xsl:when>
            <xsl:when test="$pagebreakStyle='visible'">
                <xsl:variable name="classValue">
                    <xsl:if test="local-name(..) = ('hi', 'p', 'del', 'stage')">inner</xsl:if>
                </xsl:variable>
                <xsl:if test="@rend='-' and preceding-sibling::text()">
                    <span class="hyphen">
                        <xsl:text>-</xsl:text>
                    </span>
                </xsl:if>
                <xsl:if test="local-name(..) = ('hi', 'p', 'del', 'stage')">
                    <br/>
                </xsl:if>
                <span class="pagebreak {$classValue}">
                    <xsl:call-template name="makeAnchor"/>
                    <xsl:value-of select="concat(' ', $page_folio, ' ')"/>
                    <xsl:if test="@n">
                        <xsl:text> </xsl:text>
                        <xsl:value-of select="@n"/>
                    </xsl:if>
                </span>
            <br class="pb"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:sp" priority="5">
        <div class="speaker">
            <xsl:call-template name="makeAnchor"/>
            <xsl:apply-templates select="tei:speaker"/>
            <xsl:if test="tei:speaker/following-sibling::*[1][@rend = 'inline']">
                    &#160;<xsl:apply-templates
                    select="tei:speaker/following-sibling::tei:stage[@rend = 'inline'][1]"
                /></xsl:if>
        </div>
        <xsl:apply-templates
            select="tei:*[not(self::tei:speaker) and not(self::tei:stage[@rend = 'inline'][1])]"/>
    </xsl:template>
    <xsl:template match="tei:del" priority="5">
        <xsl:element name="{if (tei:blockContext(.) or *[not(tei:is-inline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">del</xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:lb" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:body"/>
            <xsl:when test="parent::tei:back"/>
            <xsl:when test="parent::tei:front"/>
            <xsl:when test="parent::tei:p and count(./preceding-sibling::node()) = 0"/>
            <xsl:when
                test="./following-sibling::element()[1][local-name(.) = 'stage' and not(contains(./@rend, 'inline'))]"/>
            <xsl:when test="@type='hyphenInWord' and @rend='hidden'"/>
            <xsl:when test="@type='indent' and @rend='-'">
                <span class="hyphen">
                    <xsl:text>-</xsl:text>
                </span>
                <br/>
                <span class="lb_indent">&#160;</span>
            </xsl:when>
            <xsl:when test="@type='indent'">
                <br/>
                <span class="lb_indent">&#160;</span>
            </xsl:when>
            <xsl:when test="@rend='hidden'">
                <xsl:text> </xsl:text>
            </xsl:when>
            <xsl:when test="@rend='-' or @type='hyphenInWord'">
                <span class="hyphen">
                    <xsl:text>-</xsl:text>
                </span>
                <br/>
            </xsl:when>
            <xsl:when test="@rend='above'">
                <xsl:text>⌜</xsl:text>
            </xsl:when>
            <xsl:when test="@rend='below'">
                <xsl:text>⌞</xsl:text>
            </xsl:when>
            <xsl:when test="@rend">
                <br class="{@rend}"/>
            </xsl:when>
            <xsl:otherwise>
                <br/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element l</desc>
    </doc>
    <xsl:template match="tei:l" priority="5">
        <xsl:variable name="inlineStage"
            select="exists(./following-sibling::*[1][@rend = 'inline'])" as="xs:boolean"/>
        <xsl:element name="{if (ancestor::tei:head or ancestor::tei:hi) then 'span' else 'div'}">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">l</xsl:with-param>
            </xsl:call-template>
            <xsl:choose>
                <xsl:when test="ancestor::tei:div[contains(@rend,'linenumber')]">
                    <xsl:variable name="n">
                        <xsl:number/>
                    </xsl:variable>
                    <div class="numbering">
                        <xsl:choose>
                            <xsl:when test="$n mod 5 = 0">
                                <xsl:value-of select="$n"/>
                            </xsl:when>
                            <xsl:otherwise>&#160;</xsl:otherwise>
                        </xsl:choose>
                    </div>
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="$inlineStage"> &#160;<xsl:apply-templates
                    select="./following-sibling::tei:stage[@rend = 'inline'][1]"/></xsl:if>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:l[@part = 'F']" priority="6">
        <xsl:variable name="init" select="preceding::tei:l[@part = 'I'][1]"/>
        <xsl:element name="{if (ancestor::tei:head or ancestor::tei:hi) then 'span' else 'div'}">
            <xsl:attribute name="style"
                select="concat('padding-left: ', (string-length(normalize-space(string-join($init/text() | $init//*[not(./ancestor-or-self::tei:stage)]/text(), ''))) * 0.45), 'em;')"/>
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">l</xsl:with-param>
            </xsl:call-template>
            <xsl:choose>
                <xsl:when test="ancestor::tei:div[contains(@rend,'linenumber')]">
                    <xsl:variable name="n">
                        <xsl:number/>
                    </xsl:variable>
                    <div class="numbering">
                        <xsl:choose>
                            <xsl:when test="$n mod 5 = 0">
                                <xsl:value-of select="$n"/>
                            </xsl:when>
                            <xsl:otherwise>&#160;</xsl:otherwise>
                        </xsl:choose>
                    </div>
                    <xsl:apply-templates/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:stage" priority="5">
        <xsl:element
            name="{if (tei:blockContext(.) or *[not(tei:is-inline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">
                    <xsl:choose>
                        <xsl:when test="@type = 'setting'">
                            <xsl:choose>
                                <xsl:when test="ancestor::tei:text/@rend='firstfolio'">setting stage</xsl:when>
                                <xsl:when test="ancestor::tei:*/@rend='inline' or ancestor::tei:*/@place='inline'">setting stage it inline</xsl:when>
                                <xsl:otherwise>setting stage it</xsl:otherwise>
                            </xsl:choose>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="ancestor::tei:text/@rend='firstfolio'">stage</xsl:when>
                                <xsl:when test="ancestor::tei:*/@rend='inline' or ancestor::tei:*/@place='inline'">stage it inline</xsl:when>
                                <xsl:otherwise>stage it</xsl:otherwise>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:add" priority="5">
        <xsl:element
            name="{if (tei:blockContext(.) or *[not(tei:is-inline(.))]) then 'div' else 'span' }">
            <xsl:if test="./parent::tei:subst and @place='above'">
                <xsl:variable name="del" select="preceding-sibling::tei:del"/>
                <xsl:variable name="delLines" select="count($del//tei:lb)"/>
                <xsl:variable name="firstLine"
                    select="if($delLines gt 0) then(normalize-space(string-join($del//tei:lb/preceding-sibling::node()//text(),''))) else(normalize-space(string-join($del//text(),'')))"/>
                <xsl:variable name="offset" select="string-length($firstLine) * 0.45"/>
                <xsl:attribute name="style"
                    select="concat('margin-left:-',$offset,'em; margin-top:-',$delLines * 2,'em;')"
                />
            </xsl:if>
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">
                    <xsl:choose>
                        <xsl:when test="@place = 'above'">add above</xsl:when>
                        <xsl:when test="@place = 'inline'">add inline</xsl:when>
                        <xsl:otherwise>add</xsl:otherwise>
                    </xsl:choose>
                </xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:subst" priority="5">
        <xsl:element
            name="{if (tei:blockContext(.) or *[not(tei:is-inline(.))]) then 'div' else 'span' }">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default"> subst </xsl:with-param>
            </xsl:call-template>
            <xsl:if test="@hand">
                <xsl:attribute name="data-eo-hand" select="@hand"/>
            </xsl:if>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:text" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:TEI">
                <div>
                    <xsl:variable name="class" as="xs:string*">
                        <xsl:value-of select="$textType"/>
                        <xsl:if test="parent::tei:TEI/@xml:id">
                            <xsl:value-of select="parent::tei:TEI/string(@xml:id)"/>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:attribute name="class" select="string-join($class, ' ')"/>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="ancestor::tei:group and $splitLevel=0">
                <xsl:call-template name="makeDivPage">
                    <xsl:with-param name="depth">-1</xsl:with-param>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="doDivBody"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:titlePart[@type='main']" priority="5">
        <div class="titlePart main">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="tei:sic" priority="5">
        <xsl:apply-templates/>
        <xsl:if test="not(following-sibling::tei:corr)">
            <span class="sic">
                <xsl:text>[sic]</xsl:text>
            </span>
        </xsl:if>
    </xsl:template>
    <xsl:template match="tei:corr" priority="5">
        <span class="corr begin">
            <xsl:text> [recte:</xsl:text>
        </span>
        <xsl:apply-templates/>
        <span class="corr end">
            <xsl:text>]</xsl:text>
        </span>
    </xsl:template>
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>[html] <param name="value">the current segment of the value of the rend
                attribute</param><param name="rest">the remainder of the attribute</param> modified
            2014-04-28 in order to include 'spaced_out' in template for 'expanded'; removed @style;
            added @class='expanded' </desc>
    </doc>
    <xsl:template name="renderingInner">
        <xsl:param name="value"/>
        <xsl:param name="rest"/>
        <xsl:choose>
            <xsl:when test="$value='bold' or $value='bo'">
                <b>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </b>
            </xsl:when>
            <xsl:when test="$value='center'">
                <center>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </center>
            </xsl:when>
            <xsl:when test="$value='code'">
                <b>
                    <tt>
                        <xsl:call-template name="applyRend">
                            <xsl:with-param name="value" select="$rest"/>
                        </xsl:call-template>
                    </tt>
                </b>
            </xsl:when>
            <xsl:when
                test="$value='italics' or $value='italic' or $value='cursive' or         $value='it' or $value='ital'">
                <i>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </i>
            </xsl:when>
            <xsl:when test="$value='ro' or $value='roman'">
                <span style="font-style: normal">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='sc' or $value='smcap'">
                <span style="font-variant: small-caps">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='plain'">
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:when test="$value='quoted'">
                <xsl:text>‘</xsl:text>
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
                <xsl:text>’</xsl:text>
            </xsl:when>
            <xsl:when test="$value='sub'">
                <sub>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </sub>
            </xsl:when>
            <xsl:when test="$value='sup'">
                <sup>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </sup>
            </xsl:when>
            <xsl:when test="$value='important'">
                <span class="important">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='ul'">
                <u>
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </u>
            </xsl:when>
            <xsl:when test="$value='interlinMarks'">
                <xsl:text>`</xsl:text>
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
                <xsl:text>´</xsl:text>
            </xsl:when>
            <xsl:when test="$value='overbar'">
                <span style="text-decoration:overline">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='expanded' or $value='spaced_out'">
                <span class="expanded">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='strike'">
                <span style="text-decoration: line-through">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='small'">
                <span style="font-size: 75%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='large'">
                <span style="font-size: 150%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='smaller'">
                <span style="font-size: 50%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='larger'">
                <span style="font-size: 200%">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='calligraphic' or $value='cursive'">
                <span style="font-family: cursive">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='gothic'">
                <span style="font-family: Papyrus, fantasy">
                    <xsl:call-template name="applyRend">
                        <xsl:with-param name="value" select="$rest"/>
                    </xsl:call-template>
                </span>
            </xsl:when>
            <xsl:when test="$value='noindex'">
                <xsl:call-template name="applyRend">
                    <xsl:with-param name="value" select="$rest"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:choose>
                    <xsl:when test="local-name(.)='p'">
                        <xsl:call-template name="unknownRendBlock">
                            <xsl:with-param name="rest" select="$rest"/>
                            <xsl:with-param name="value" select="$value"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="unknownRendInline">
                            <xsl:with-param name="rest" select="$rest"/>
                            <xsl:with-param name="value" select="$value"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
<doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>Process element name in mode "plain"</desc>
    </doc>
    <xsl:template match="tei:name" priority="5">
        <span class="name">
            <xsl:apply-templates/>
        </span>
    </xsl:template>

    <xsl:template match="tei:*[@rend = 'underline' and @n = '2']" priority="6">
        
        <xsl:variable name="default">
            <xsl:next-match/>
        </xsl:variable>
        <xsl:element name="{$default/node()/local-name()}">
            <xsl:attribute name="class" select="concat($default/node()/@class, ' n2')"/>
            <xsl:for-each select="$default/node()/node() | $default/node()/@* except $default/node()/@class">
                <xsl:copy-of select="."/>
            </xsl:for-each>
        </xsl:element>
    </xsl:template>
<xsl:template match="tei:ref[starts-with(@target, '#footnote')]" priority="5">
        <xsl:variable name="footnote_id" select="substring(./@target, 2)" as="xs:string"/>
        
        <xsl:choose>
            <xsl:when test="count(//tei:note[@xml:id=$footnote_id]/*) &gt; 0">
                <span class="footnote tipped" data-tipped-options="inline: '{$footnote_id}_tipped'">
                    <xsl:apply-templates/>
                </span>
                <div id="{$footnote_id}_tipped" style="display: none;">
                    <xsl:apply-templates select="//tei:note[@xml:id=$footnote_id]"/>
                </div>
            </xsl:when>
            <xsl:when test="exists(//tei:note[@xml:id=$footnote_id])">
                <span class="footnote scrollto" data-footnote="{$footnote_id}">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <span class="footnote">
                    <xsl:apply-templates/>
                </span>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="tei:milestone">
        <xsl:variable name="className" as="xs:string*">
            <xsl:for-each select="@* except @xml:id">
                <xsl:value-of select="concat(local-name(.), '_', string(.))"/>
            </xsl:for-each>
        </xsl:variable>
        <a class="{string-join($className, ' ')}" id="{./string(@xml:id)}"><!-- anchor --></a>
    </xsl:template>
    
    <xsl:template match="tei:supplied">
        <xsl:text>[</xsl:text><xsl:apply-templates/><xsl:text>]</xsl:text>
    </xsl:template>
    <xsl:template match="tei:note[@type='commentary']">
        <xsl:variable name="no" select="count(./preceding::tei:note[@type='commentary'])"/>
        <!-- für Einzelkommentare -->
        <!--<div class="note_K tipped" data-tipped-options="inline: 'tip{$no}'" style="float:right; margin-right: 30px;">
            <i class="fa fa-comment-o fa-fw fa-lg"/>
        </div>
        <div id="tip{$no}" style="display: none;">
            <strong>Kommentar Einzelquelle</strong>
            <br/>
            <xsl:apply-templates/>
        </div>-->
        <!-- Für Kommentare im Text -->
        <span class="tipped" data-tipped-options="inline: 'tip{$no}'"><i class="fa fa-comment-o inline-comment"/></span>
        <div id="tip{$no}" style="display: none;">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>
            <p>Process element note</p>
            <p>copied from TEI Stylesheets xhtml2/core.xsl in order to fix link target in Edirom-Online</p>
        </desc>
    </doc>
    <xsl:template match="tei:note">
        <xsl:variable name="identifier">
            <xsl:call-template name="noteID"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="@place='none'"/>
            <xsl:when test="ancestor::tei:listBibl or ancestor::tei:biblFull         or ancestor::tei:biblStruct">
                <xsl:text> [</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>]</xsl:text>
            </xsl:when>
            <xsl:when test="@place='foot' or @place='bottom' or @place='end' or $autoEndNotes='true'">
                <xsl:element name="{if (parent::tei:head or parent::tei:hi)  then 'span'           else if (parent::tei:l) then 'span'           else if (parent::tei:bibl/parent::tei:head) then 'span'           else if (parent::tei:stage/parent::tei:q) then 'span'           else if  (parent::tei:body or *[not(tei:is-inline(.))]) then 'div' else 'span' }">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="concat($identifier,'_return')"/>
                    </xsl:call-template>
                    <xsl:variable name="note-title">
                        <xsl:variable name="note-text">
                            <xsl:apply-templates mode="plain"/>
                        </xsl:variable>
                        <xsl:value-of select="substring($note-text,1,500)"/>
                        <xsl:if test="string-length($note-text) &gt; 500">
                            <xsl:text>…</xsl:text>
                        </xsl:if>
                    </xsl:variable>
                    <xsl:choose>
                        <xsl:when test="$footnoteFile='true'">
                            <a class="notelink" title="{normalize-space($note-title)}" href="{$masterFile}-notes.html#{$identifier}">
                                <xsl:element name="{if (@rend='nosup') then 'span' else 'sup'}">
                                    <xsl:call-template name="noteN"/>
                                </xsl:element>
                            </a>
                            <xsl:if test="following-sibling::node()[1][self::tei:note]">
                                <xsl:element name="{if (@rend='nosup') then 'span' else 'sup'}">
                                    <xsl:text>,</xsl:text>
                                </xsl:element>
                            </xsl:if>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:element name="a">
                                <!-- here are the Edirom Online specific modifications -->
                                <xsl:attribute name="class">notelink</xsl:attribute>
                                <xsl:attribute name="href" select="$docUri || '#' || $identifier"/>
                                <xsl:attribute name="title" select="normalize-space($note-title)"/>
                                <xsl:attribute name="onclick">
                                    <xsl:text>loadLink('</xsl:text>
                                    <xsl:value-of select="$docUri || '#' || $identifier"/>
                                    <xsl:text>', {useExisting:true}); return false;</xsl:text>
                                </xsl:attribute>
                                <!-- end of the Edirom Online specific modifications -->
                                <xsl:element name="{if (@rend='nosup') then 'span' else 'sup'}">				  
                                    <xsl:call-template name="noteN"/>
                                </xsl:element>
                            </xsl:element>
                            <xsl:if test="following-sibling::node()[1][self::tei:note]">
                                <xsl:element name="{if (@rend='nosup') then 'span' else 'sup'}">
                                    <xsl:text>,</xsl:text>
                                </xsl:element>
                            </xsl:if>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:element>
            </xsl:when>
            <xsl:when test="parent::tei:head and @place='margin'">
                <span class="margnote">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="parent::tei:head">
                <xsl:text> [</xsl:text>
                <xsl:apply-templates/>
                <xsl:text>]</xsl:text>
            </xsl:when>
            <xsl:when test="@type='footnote'">
                <div class="note">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <span class="noteNumber">
                        <xsl:number/>
                    </span>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="(@place='display' or tei:q)          and (parent::tei:div or parent::tei:p or parent::tei:body)">
                <div class="note">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <span class="noteLabel">
                        <xsl:choose>
                            <xsl:when test="@n">
                                <xsl:value-of select="@n"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:call-template name="i18n">
                                    <xsl:with-param name="word">Note</xsl:with-param>
                                </xsl:call-template>
                                <xsl:text>: </xsl:text>
                            </xsl:otherwise>
                        </xsl:choose>
                    </span>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="@place='display'">
                <blockquote>
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:call-template name="rendToClass"/>
                    <xsl:choose>
                        <xsl:when test="$outputTarget='html5'">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:when test="tei:q">
                            <xsl:apply-templates/>
                        </xsl:when>
                        <xsl:otherwise>
                            <p>
                                <xsl:apply-templates/>
                            </p>
                        </xsl:otherwise>
                    </xsl:choose>
                </blockquote>
            </xsl:when>
            <xsl:when test="@place='margin' and parent::tei:hi and not(*)">
                <span class="margnote">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="@place='margin' and *[not(tei:is-inline(.))]">
                <div class="margnote">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:apply-templates/>
                </div>
            </xsl:when>
            <xsl:when test="@place='margin'">
                <span class="margnote">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:when test="@place='inline' or (parent::tei:p or parent::tei:hi or parent::tei:head)">
                <span class="note">
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:text> [</xsl:text>
                    <xsl:apply-templates/>
                    <xsl:text>]</xsl:text>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <div>
                    <xsl:call-template name="makeAnchor">
                        <xsl:with-param name="name" select="$identifier"/>
                    </xsl:call-template>
                    <xsl:attribute name="class">
                        <xsl:text>note </xsl:text>
                        <xsl:value-of select="@type"/>
                    </xsl:attribute>
                    <span class="noteLabel">
                        <xsl:choose>
                            <xsl:when test="@n">
                                <xsl:value-of select="@n"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:call-template name="i18n">
                                    <xsl:with-param name="word">Note</xsl:with-param>
                                </xsl:call-template>
                                <xsl:text>: </xsl:text>
                            </xsl:otherwise>
                        </xsl:choose>
                    </span>
                    <xsl:apply-templates/>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>
            <p>Process element note</p>
            <p>copied from TEI Stylesheets xhtml2/core.xsl in order to fix link target in Edirom-Online</p>
        </desc>
    </doc>
    <xsl:template name="makeaNote">
        <xsl:variable name="identifier">
            <xsl:call-template name="noteID"/>
        </xsl:variable>
        <xsl:if test="$verbose='true'">
            <xsl:message>Make note <xsl:value-of select="$identifier"/></xsl:message>
        </xsl:if>
        <div class="note">
            <xsl:call-template name="makeAnchor">
                <xsl:with-param name="name" select="$identifier"/>
            </xsl:call-template>
            <span class="noteLabel">
                <xsl:call-template name="noteN"/>
                <xsl:if test="matches(@n,'[0-9]')">
                    <xsl:text>.</xsl:text>
                </xsl:if>
                <xsl:text> </xsl:text>
            </span>
            <div class="noteBody">
                <xsl:apply-templates/>
            </div>
            <xsl:if test="$footnoteBackLink= 'true'">
                <xsl:text> </xsl:text>
                <xsl:element name="a">
                    <!-- here are the Edirom Online specific modifications -->
                    <xsl:attribute name="class">link_return</xsl:attribute>
                    <xsl:attribute name="href" select="$docUri || '#' || $identifier || '_return'"/>
                    <xsl:attribute name="title">"Go back to text</xsl:attribute>
                    <xsl:attribute name="onclick">
                        <xsl:text>loadLink('</xsl:text>
                        <xsl:value-of select="$docUri || '#' || $identifier || '_return'"/>
                        <xsl:text>', {useExisting:true}); return false;</xsl:text>
                    </xsl:attribute>
                    <!-- end of the Edirom Online specific modifications -->
                    <xsl:text>↵</xsl:text>
                </xsl:element>
            </xsl:if>
        </div>
    </xsl:template>
    
    <xsl:template match="tei:quote" priority="5">
        <xsl:choose>
            <xsl:when test="parent::tei:cit[@rend = 'inline']">
                <span class="quote inline">
                    <xsl:apply-templates/>
                </span>
            </xsl:when>
            <xsl:otherwise>
                <div class="citquote">
                    <xsl:apply-templates/>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="stdfooter">
        <xsl:param name="title"/>
    </xsl:template>
    <xsl:template name="stdheader">
        <xsl:param name="title"/>
    </xsl:template>
    
</xsl:stylesheet>