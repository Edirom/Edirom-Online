<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns="http://www.w3.org/1999/xhtml"
    exclude-result-prefixes="xs xd html"
    version="3.0">
    
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Jun 19, 2013</xd:p>
            <xd:p><xd:b>Author:</xd:b> Daniel Röwenstrunk</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:output encoding="UTF-8" method="xml"/>
    
    <!--<xsl:template match=".//html:div[@class='p-in-sp']">-->
       
    	<!--<div class="test">
            
            <xsl:apply-templates select="@* | node()"/>
        </div>-->
        
      <!-- <xsl:for-each select=".//html:span[@class='subst']">
           <div class="difference">
               
           <div class="hand1_bg writerBox" style="color:red; background-color:gray;">
            
               <xsl:apply-templates select=".//html:span[@class='del']"/>
           </div>
         
           </div>
           
       </xsl:for-each>
        
        <xsl:for-each select=".//html:span[@class='subst']">
            <div class="difference">
                
                <div class="hand1_bg writerBox" style="color:blue;margin-left:+2em;">
                    <xsl:apply-templates select=".//html:span[@class='add above']"/>
                </div>
            </div>
            
        </xsl:for-each>
        
        <div class="test_1">
            <div class="hand1_bg writerBox" style="color:green;">
                <xsl:apply-templates select=".//html:span[@class='add']"/>
            </div>
        </div>
       
    </xsl:template>-->
<!-- 1. Finde ein class=subst
	 2. gehe zu parentKnoten class=p-in-sp  (in div) und überprüfe, (ob subst sich da schliesst)
	 3. kopiere parent elment nach anzahl von kopisten: eigene farbe, die änderungen mit mehr farbeontesität
	 4. -->
	
	
	<!--<xsl:template match=".//html:div[@class='p-in-sp']">	
		<xsl:for-each select=".//html:span[@class='subst']">
			<div class="difference">
				
				<div class="hand1_bg writerBox" style="color:red; background-color:gray;">
				
					<xsl:apply-templates select=".//html:span[@class='del']"/>
				</div>
				
			</div>
			
		</xsl:for-each>
		
		<xsl:for-each select=".//html:span[@class='subst']">
			<div class="difference">
				
				<div class="hand1_bg writerBox" style="color:blue;margin-left:+2em;">
					<xsl:apply-templates select=".//html:span[@class='add above']"/>
				</div>
			</div>
			
		</xsl:for-each>
		
		<div class="test_1">
			<div class="hand1_bg writerBox" style="color:green;">
				<xsl:apply-templates select=".//html:span[@class='add']"/>
			</div>
		</div>
	
	</xsl:template>-->
	
	
	<!--<xsl:template match="*[child::html:span[@class='subst'] or child::html:span[contains(@class, 'del')] or child::html:span[contains(@class, 'add')]]">
		<!-\-<div class="hand1_bg writerBox" style="background-color:gray;">			
			<xsl:apply-templates select="text()"/>
		</div>
		
		<xsl:if test="html:span[@class='subst']">
			<div class="hand1_bg writerBox_1" style="background-color:green;">				
				<xsl:apply-templates select="text()"/>						
			</div>
		</xsl:if>	-\->
		<xsl:choose>
			<xsl:when test="self::html:span[@class='subst']">
				
				<div class="difference">
					<div class="hand1_bg writerBox" style="color:red;">
						<div class="diff_desc">
							kopist 1
						</div>
						<span class="stage it center">
							<span class="underline">
								<!-\-not for SEQ-\->
								<xsl:apply-templates select=".//self::html:span[@class='del' and not(child::html:span[contains(@class, 'add')])]"/>	
								<xsl:if test=".//html:span[contains(@class, 'add') and parent::html:span[@class='del']]">
									<div class="hand3_bg_extra" style="color:cyan;">
										<div class="diff_desc">
											kopist 2
										</div>
										<xsl:apply-templates select=".//html:span[contains(@class, 'add') and parent::html:span[@class='del']]"/>
										<span
											class="plus_minus" style="margin-left: 106px;">+
										</span>
									</div>	
								</xsl:if>
								
								<!-\-<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-\->
								
							</span>
						</span>			
					</div>
					<!-\-<xsl:if test="html:span[@class='add' and not(parent::html:span[@class='del'])]">-\->
						<div class="hand2_bg writerBox" style="color:pink;">
							<div class="diff_desc">
								kopist 3
							</div>				
							<span class="stage it center">
								<xsl:apply-templates select=".//html:span[contains(@class, 'add')  and not(parent::html:span[@class='del'])]"/>
							</span>				
						</div>
						<!-\-</xsl:if>-\->	
				</div> 
			</xsl:when>
			
			<!-\-<xsl:when test="html:span[@class='add' and not(ancestor::html:span[@class='subst'])]">
				<div class="hand_bg writerBox_ADD" style="color:green;">
					<div class="diff_desc" style="color:green;">
						kopist 4
					</div>
					<span class="stage it center">
						<xsl:apply-templates/>
						<!-\\-<xsl:apply-templates select=".//html:span[contains(@class, 'add')]"/>-\\->
					</span>
				</div>	
			</xsl:when>-\->
			
			<!-\-<xsl:when test="html:span[@class='del' and not(ancestor::html:span[@class='subst'])]">
				<div class="hand_bg writerBox_DEL" style="color:yellow;">
					<div class="diff_desc" style="color:yellow;">
						<!-\\-<xsl:value-of select=".//html:span[contains(@class, 'del')]/@role" />-\\->
						kopist 5
					</div>
					<span class="stage it center">
						<span class="underline">
							<!-\\-<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-\\->
							<xsl:apply-templates/>
						</span>
					</span>
				</div>		
			</xsl:when>-\->
		</xsl:choose>
	</xsl:template>-->
   
	
	<xsl:template match="html:span[@class='subst']">
	<!--<xsl:template match="html:div[@class='p-in-sp' and .//html:span[@class='subst']]">-->		
		<div class="difference">
			<div class="hand1_bg writerBox" style="color:red; background-color:gray;">
				<div class="diff_desc">
					kopist 1
				</div>
				<span class="stage it center">
					<span class="underline">
						<xsl:apply-templates select=".//self::html:span[@class='del' and not(child::html:span[contains(@class, 'add')])]"/>	
						<xsl:if test=".//html:span[contains(@class, 'add') and parent::html:span[@class='del']]">
							<div class="hand3_bg_extra" style="color:cyan;">
								<div class="diff_desc">
									kopist 2
								</div>
								<xsl:apply-templates select=".//html:span[contains(@class, 'add') and parent::html:span[@class='del']]"/>
								<span
									class="plus_minus" style="margin-left: 106px;">+
								</span>
							</div>	
						</xsl:if>
						
						<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-->
												
				</span>
				</span>			
			</div>
			<!--<xsl:if test="html:span[@class='add' and not(parent::html:span[@class='del'])]">-->
			<div class="hand2_bg writerBox" style="color:pink;">
				<div class="diff_desc">
					kopist 3
				</div>				
					<span class="stage it center">
						<xsl:apply-templates select=".//html:span[contains(@class, 'add')  and not(parent::html:span[@class='del'])]"/>
					</span>				
			</div>
			<!--</xsl:if>-->	
		</div> 
	</xsl:template>
	
	<xsl:template match="html:span[contains(@class, 'add') and not(ancestor::html:span[@class='subst'])]">
		<xsl:choose>		
			<xsl:when test="self::html:span[@class='addSpan']">
				<div class="hand_bg writerBox_DEL" style="color:brown;">
					<div class="diff_desc_ancor">
						<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]/@role" />-->
						kopist 7
					</div>
					<span class="stage it center">
						<span class="underline">
							<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-->
							<xsl:apply-templates/>
						</span>
					</span>
				</div>
			</xsl:when>
			<xsl:otherwise>				
				<div class="hand_bg writerBox_ADD" style="color:green;">
					<div class="diff_desc" style="color:green;">
						kopist 4
					</div>
					<span class="stage it center">
						<xsl:apply-templates/>
						<!--<xsl:apply-templates select=".//html:span[contains(@class, 'add')]"/>-->
					</span>
				</div>	
			</xsl:otherwise>			
		</xsl:choose>
	</xsl:template>
		
	<xsl:template match="html:span[contains(@class, 'del') and not(ancestor::html:span[@class='subst'])]">
		<xsl:choose>		
			<xsl:when test="self::html:span[@class='delSpan']">
				<div class="hand_bg writerBox_DEL" style="color:orange;">
					<div class="diff_desc_ancor">
						<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]/@role" />-->
						kopist 6
					</div>
					<span class="stage it center">
					<span class="underline">
						<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-->
						<xsl:apply-templates/>
					</span>
				</span>
				</div>
			</xsl:when>
			<xsl:otherwise>
				<div class="hand_bg writerBox_DEL" style="color:yellow;">
					<div class="diff_desc">
						<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]/@role" />-->
						kopist 5
					</div>
					<span class="stage it center">
						<span class="underline">
							<!--<xsl:value-of select=".//html:span[contains(@class, 'del')]"/>-->
							<xsl:apply-templates/>
						</span>
					</span>
				</div>
				
			</xsl:otherwise>			
		</xsl:choose>
		
	</xsl:template>
	
    <!--<!-\-<xsl:template match="html:span[@class='subst']">-\->
       <xsl:template match="html:div[@class='p-in-sp' and .//html:span[@class='subst']]">
   
       	<div class="difference">
            <div class="hand1_bg writerBox" style="color:red; background-color:gray;">
            
            
              <!-\- <xsl:apply-templates select="../../@br"/>-\->
                <xsl:apply-templates select=".//html:span[@class='del']"/>
               
                    <!-\-<xsl:apply-templates select="@* | node()"/>-\->
                
            </div>
            <div class="hand2_bg writerBox" style="color:blue; margin-left:+2em;">
                <!-\-<xsl:copy>-\->
                    <xsl:apply-templates select=".//html:span[@class='add above']"/>
                    <!-\-<xsl:apply-templates select="@* | node()"/>-\->
                <!-\-</xsl:copy>-\->
            </div>
        </div>  
    	
    </xsl:template>-->
    	
    
    <xsl:template match="node() | @* | comment() | processing-instruction()">
        <xsl:copy>
            <xsl:apply-templates select="@* | node()"/>
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>